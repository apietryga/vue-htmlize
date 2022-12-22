const fs = require('fs')
const path = require('path');
// const { exec } = require('exec')
const { exec } = require('child_process');

const htmlize = {
  config: {
    dist: "public",
    ignore: [ 'favicon.ico', '.htaccess' ],
    missingFolders: [],
    clean: false,
    template: "index.html",
  },
  byRouter( router ){
    htmlize.generateHTMLs( router.getRoutes() )
  },
  cmdRun( ){
    const p = path.resolve("htmlize/routes.js");
    const routes = require( p )
    htmlize.generateHTMLs( routes )
  },
  completeMissingFolders( route ){
    for(const [ index, part ] of route.path.split("/").entries()){
      if([''].includes(part) 
      || index + 1 == route.path.split("/").length){ 
        continue 
      }
      const dPath = htmlize.config.dist + '/' + part
      if(!htmlize.config.missingFolders.includes(dPath)){
        htmlize.config.missingFolders.push( path.resolve( dPath ) )
      }
      if(!fs.existsSync( dPath )){
        fs.mkdirSync( dPath )
        return dPath
      }
    }
  },
  async deleteUnusedFiles( currentPathes ){
    const allPathes = await htmlize.getPathMap(path.resolve( htmlize.config.dist ));
    const unusedPathes = allPathes
      .filter( p => ! currentPathes.includes( p ) )  // filter from current list
      .filter( uPath => {   // filter from ignored list
        for(const ig of htmlize.config.ignore){
          const iPath = path.resolve(htmlize.config.dist, ig)
          if(uPath.includes(iPath)){ return false }
        }
        return true
      })

    for( const uPath of unusedPathes ){
      fs.lstatSync(uPath).isDirectory() ? fs.rmdirSync( uPath ) : fs.rmSync( uPath );
    }    
  },
  async deploy(){
    try {
      await exec("git", ["checkout", "--orphan", "public"]);
      console.log("Building started...");
      await exec("npm", ["run", "build"]);
      const folderName = fs.existsSync("dist") ? "dist" : "build";
      await exec("git", ["--work-tree", folderName, "add", "--all"]);
      await exec("git", ["--work-tree", folderName, "commit", "-m", "public"]);
      await exec("git", ["push", "origin", "HEAD:public", "--force"]);
      await exec("git", ["checkout", "-f", "master"]);
      await exec("git", ["branch", "-D", "public"]);
      console.log("Successfully deployed, check your settings");
    } catch (e) {
      console.log(e.message);
      process.exit(1);
    }

  },
  async getPathMap( dir ){
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true })
    const files = await Promise.all(dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name)
      return dirent.isDirectory() ? htmlize.getPathMap(res) : res;
    }));
    return Array.prototype.concat(...files, dir)
  },
  generateHTMLContent( route ){
    const template = fs.readFileSync(htmlize.config.template, 'utf-8')
    const firstPart = template.split("<title>")[0]
    const secondPart = template.split("</title>")[1]
    const result = firstPart + '<title>' + route.name + '</title>' + secondPart;
    return result
  },
  generateHTMLs( routes ){
    htmlize.generateHtaccess( )
    const pathes = htmlize.config.ignore.map( p => { return path.resolve( htmlize.config.dist, p ) })
    pathes.push( path.resolve( htmlize.config.dist ) )
    for(const route of routes){
      htmlize.completeMissingFolders( route )
      const sPath = path.resolve( htmlize.config.dist + htmlize.serializeNames( route.path ) + '.html' )
      fs.writeFileSync( sPath, htmlize.generateHTMLContent(route) )
      pathes.push(sPath)
    }
    pathes.push( ...htmlize.config.missingFolders )
    if(this.config.clean){
      htmlize.deleteUnusedFiles( pathes )
    }
  },
  generateHtaccess( ){
    fs.writeFileSync( htmlize.config.dist + '/.htaccess', `RewriteEngine On\nRewriteCond %{REQUEST_FILENAME} !-f\nRewriteRule ^([^\.]+)$ $1.php [NC,L]` )
  },
  serializeNames( name ){
    if(name.includes("*")){ return '/404'}
    if(name == "/" ){ return '/index'}
    return name
  }
}

module.exports = htmlize
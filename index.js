const fs = require('fs')
const path = require('path');

const htmlize = {
  config: {
    path: "public",
    ignore: [ 'favicon.ico', '.htaccess' ],
    missingFolders: [],
    clean: false,
  },
  byRouter( router ){
    htmlize.generateHTMLs( router.getRoutes() )
  },
  completeMissingFolders( route ){
    for(const [ index, part ] of route.path.split("/").entries()){
      if([''].includes(part) 
      || index + 1 == route.path.split("/").length){ 
        continue 
      }
      const dPath = htmlize.config.path + '/' + part
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
    const allPathes = await htmlize.getPathMap(path.resolve( htmlize.config.path ));
    const unusedPathes = allPathes
      .filter( p => ! currentPathes.includes( p ) )  // filter from current list
      .filter( uPath => {   // filter from ignored list
        for(const ig of htmlize.config.ignore){
          const iPath = path.resolve(htmlize.config.path, ig)
          if(uPath.includes(iPath)){ return false }
        }
        return true
      })

    for( const uPath of unusedPathes ){
      fs.lstatSync(uPath).isDirectory() ? fs.rmdirSync( uPath ) : fs.rmSync( uPath );
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
  generateHTMLs( routes ){
    const pathes = htmlize.config.ignore.map( p => { return path.resolve( htmlize.config.path, p ) })
    pathes.push( path.resolve( htmlize.config.path ) )
    for(const route of routes){
      htmlize.completeMissingFolders( route )
      const sPath = path.resolve( htmlize.config.path + htmlize.serializeNames( route.path ) + '.html' )
      fs.writeFileSync( sPath, 'xdddx' )
      pathes.push(sPath)
    }
    pathes.push( ...htmlize.config.missingFolders )
    if(this.config.clean){
      htmlize.deleteUnusedFiles( pathes )
    }
  },
  serializeNames( name ){
    if(name.includes("*")){ return '/404'}
    if(name == "/" ){ return '/index'}
    return name
  }
}

module.exports = htmlize
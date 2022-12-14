const fs = require('fs')
const path = require('path');

const htmlize = {
  config : {
    path : "public",
    ignore : [ 'favicon.ico' ],
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

      if(!fs.existsSync(htmlize.config.path + '/' + part)){
        fs.mkdirSync(htmlize.config.path + '/' + part)
      }
    }
  },
  async deleteUnusedFiles( currentPathes ){
    const allPathes = await htmlize.getPathMap(htmlize.config.path);
    const unusedPathes = allPathes.filter( p => ! currentPathes.includes( p ) );
    for( const uPath of unusedPathes){
      fs.rmSync( uPath )
    }    
  },
  async getPathMap( dir ){
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true })
    const files = await Promise.all(dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name)
      return dirent.isDirectory() ? htmlize.getPathMap(res) : res;
    }));
    return Array.prototype.concat(...files)
  },
  generateHTMLs( routes ){
    const pathes = htmlize.config.ignore.map( p => { return path.resolve( htmlize.config.path, p ) })
    console.log({ pathes })
    for(const route of routes){
      htmlize.completeMissingFolders( route )
      const sPath = path.resolve( htmlize.config.path + htmlize.serializeNames( route.path ) + '.html' )
      fs.writeFileSync( sPath, 'xdddx' )
      pathes.push(sPath)
    }
    htmlize.deleteUnusedFiles( pathes )
  },
  serializeNames( name ){
    if(name.includes("*")){ return '/404'}
    if(name == "/" ){ return '/index'}
    return name
  }
}

exports.htmlize = htmlize 
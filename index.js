const fs = require('fs')
const path = require('path');

const htmlize = {
  config: {
    path: "public",
    ignore: [ 'favicon.ico' ],
    missingFolders: [],
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
    const unusedPathes = allPathes.filter( p => ! currentPathes.includes( p ) )  // filter from current list

    // console.log(htmlize.config.ignore)
    // ignore folders
    const toRemovePathes = []
    for(const ig of htmlize.config.ignore){
      const iPath = path.resolve(htmlize.config.path, ig)
      // console.log(path.resolve(ig))
      let contains = false
      let uPath;
      for(uPath of unusedPathes){
        if(!uPath.includes(iPath)){
          // console.log({uPath, iPath})
          // console.log('true')
          contains = true
          break
        }
      }
      // if(!contains){
      if(uPath && !toRemovePathes.includes(uPath)){
        toRemovePathes.push(uPath)
      }
    }

    for( const uPath of toRemovePathes){
      if(fs.lstatSync(uPath).isDirectory() ){
        fs.rmdirSync( uPath )
      }else{
        fs.rmSync( uPath )
      }
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
    htmlize.deleteUnusedFiles( pathes )
  },
  serializeNames( name ){
    if(name.includes("*")){ return '/404'}
    if(name == "/" ){ return '/index'}
    return name
  }
}

exports.htmlize = htmlize 
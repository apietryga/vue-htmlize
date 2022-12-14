const fs = require('fs')
const { resolve } = require('path');

const htmlize = {
  config : {
    path : "public"
  },
  byRouter( router ){
    htmlize.generateHTMLs( router.getRoutes() )
  },
  completeMissingFolders( route ){
    for(const [ index, part ] of route.path.split("/").entries()){
      if([''].includes(part) 
      || index + 1 == route.path.split("/").length)
        { continue }

      if(!fs.existsSync(htmlize.config.path + '/' + part)){
        fs.mkdirSync(htmlize.config.path + '/' + part)
      }
    }
  },
  async deleteUnusedFiles( pathes ){
    const oldPathes = await htmlize.getPathMap(htmlize.config.path);
    console.log({ oldPathes })

  },
  async getPathMap(dir){
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true })
    const files = await Promise.all(dirents.map((dirent) => {
      const res = resolve(dir, dirent.name)
      return dirent.isDirectory() ? htmlize.getPathMap(res) : res;
    }));
    return Array.prototype.concat(...files)
  },
  generateHTMLs( routes ){
    const pathes = []
    for(const route of routes){
      htmlize.completeMissingFolders( route )
      const path = htmlize.config.path + htmlize.serializeNames( route.path ) + '.html'
      fs.writeFileSync( path, 'xdddx' )
      pathes.push(path)
    }
    htmlize.deleteUnusedFiles(pathes)
  },
  serializeNames( name ){
    if(name.includes("*")){ return '/404'}
    if(name == "/" ){ return '/index'}
    return name
  }

}
exports.htmlize = htmlize 
# vue-htmlize
Make working OG Tags and SEO in pure Vue projects.
Improve your SEO in SPA apps!

## Get started
### Install
```bash
npm i vue-htmlize
```

### Config
- Make folder *htmlize* and create file *routes.js* in it.
```js
// You can copy paste here router.getRoutes() from vue router 

module.exports = [
  {
      "path": "/projects/anadar",
      "name": "anadar",
      "meta": {},

  ...
```
### Run
```bash
node -e 'require(\"../index.js\").cmdRun()'
```

### Output

![beforeafter](/img/beforeafter.webp)

## Contributing
Feel free to contribute at [GitHub](https://github.com/apietryga/vue-htmlize)


<!-- ### EXPERIMENTAL AND TODO:
Few options to setup it for your project
```js
// deletes unused files in public dir [ default : false ]
htmlize.config.clean = true

// files excluded from deletion [ default : '.htaccess', 'favicon.ico' ]
htmlize.config.ignore = [ '.htaccess', 'favicon.ico', 'img' ]

// directory for public files [ default: 'public']
htmlize.config.dist = "public"

// html template file to set global options (fonts, css) [ default: "index.html" ]
htmlize.config.template = "index.html"
``` -->
# vue-htmlize
Make working OG Tags and SEO in pure Vue projects.
Improve your SEO in SPA apps!


## Get started

### Install

```bash
npm i vue-htmlize
```

### Config in vue
In **main.ts** or **main.js** just import vue-htmlize
```js
import App from './App.vue'
import router from './router'

import htmlize from 'vue-htmlize' // import it
htmlize.byRouter(router) // generate htmls by router

const app = createApp(App)
app.use(router)
app.mount('#app')
```


### Options
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

```

## Contributing
Feel free to contribute at [GitHub](https://github.com/apietryga/vue-htmlize)
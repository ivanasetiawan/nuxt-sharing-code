# Nuxt sharing code
Experiment of:
- header App
- shell App

Share code between these 2 Apps. This is an attemp to test microservice on FE.

## Usage
> npx nuxt

on the shell / header app

Make changes on this Header App and see it on Shell App.
Next to do is to use VueX(?) to share the state.

## URL
- `/login`
- `/componentPage`


## Step by step
### 1) Lerna
A lerna mono repo is easy to setup and means a great developer experience (not necessary, but pretty - so why notski). We can make modifications in common code while running a portal and get hot reloading.
Within a new folder let’s create a 2 package repo:
```bash
> npm install -g lerna
> lerna init
> lerna create header --dependencies nuxt --yes
> lerna create shell --dependencies nuxt header --yes
> lerna bootstrap
```

Packages can be started like this:
```bash
> cd packages/header
> npx nuxt
```

### 2) Create Pages
```bash
> mkdir pages
> cd pages
> echo '<template><div>Hola this is login!</div></template' > login.vue
```
Now view http://localhost:3000/login (note the root page will no longer be generated)

To get this page included in `shell`, we will package it as a Nuxt module. So in the root of `header` create a file called `module.js` with the following:

```js
// Nuxt exposes its default route builder logic here
import { createRoutes } from '@nuxt/utils'

// with a lot of pages it might be worth considering a folder pass
// to dynamically create this list
const pages = ['pages/login.vue']

export default function NuxtModule() {
  const { routeNameSplitter, trailingSlash } = this.options.router
  this.extendRoutes((routes) => {
    routes.push(...createRoutes({
      files: pages,
      srcDir: __dirname,
      pagesDir: 'pages',
      routeNameSplitter,
      trailingSlash,
    }))
  })
}
```
Nuxt modules have a convenient extendRoutes helper exposed, coupling this with the Nuxt page-to-route generation (createRoutes), the code to inject the page routes is short and straight-forward.

In `shell` add a `nuxt.config.js` file with:
```js
export default {
  modules: ['header/module']
}
```
TEST ~ is it working:
Now stop the `header` nuxt server and start one in `shell`(run `npx nuxt` on shell folder). Go to localhost:3000/login


### 3) Create Layouts
Back to `header` and create a default layout:
```bash
> mkdir layouts
> cd layouts
> echo '<template><center><nuxt/></center></template>' > default.vue
```

in `module.js` add: 
```js
import { createRoutes, relativeTo } from '@nuxt/utils'
import path from 'path'

...
// at the end of the NuxtModule function
const layoutPath = (file) =>
  relativeTo(
    this.options.buildDir,
    path.resolve(__dirname, 'layouts', file),
  )

this.nuxt.hook('build:templates', ({ templateVars }) => {
  templateVars.layouts.default = layoutPath('default.vue')
})
```
Here we are using a hook to provide layouts at the right time in the build process. The layoutPath function will provide a path to the dependency layout files relative to the project build directory.

Refresh http://localhost:3000/login and the new default layout should be applied.

### 4) Create Static content
In `header`, add an image
```bash
> mkdir static
> cd static
> PUT IMAGE IN THIS FOLDER
```

`module.js` add:
```js
import serveStatic from 'serve-static'

...
// at the end of the NuxtModule function
this.addServerMiddleware(
  serveStatic(path.resolve(__dirname, 'static')),
```
This is the same middleware Nuxt uses internally for a local static folder, we just configure an additional one connected to the module’s static content.

TEST ~ is it working:
Restart `shell` nuxt server and go to:
localhost:3000/imagename.jpg


### 5) Create Components
As already mentioned, components can easily be imported from an npm package, but there is a nice feature in recent Nuxt versions, which discovers components. There are extension patterns out of the box, but here is another.

Create component in `header`:
```bash
> mkdir components
> cd components
> echo '<template><div>Simple Component</div></template>' > comp.vue
> cd ../pages
> echo '<template><comp/></template>' > componentPage.vue
```

Test it in header(from package root):
```bash
> echo 'export default { components: true }' > nuxt.config.js
> npx nuxt
```
Go to http://localhost:3000/componentPage

To provide the same component and page in the `module.js`:
```js
// update pages array
const pages = ['pages/login.vue', 'pages/componentPage.vue']
....
// at the end of the NuxtModule function
this.nuxt.hook('components:dirs', (dirs) => {
  dirs.unshift({
    path: path.resolve(__dirname, 'components'),
    level: 1, // provide a priority
  })
})
```
This is a hook specifically provided to extend the folders for components, however most examples specify a prefix and I have intentionally left it out.

Go to `shell` and add `components: true` on `nuxt.config.js` and run the server. Go to http://localhost:3000/componentPage (should work too!)

On `shell`:
```bash
> mkdir components
> cd components
```

Create `comp.vue` and add:
```js
<template>
  <comp class="bg-red"/>
</template>

<style>
  .red { background-color: red; }
</style>

<script>
import comp from 'header/components/comp.vue'
export default {
  components: { comp },
}
</script>
```
Go to http://localhost:3000/componentPage and you should see the override.


### Thank you!
Materials I read / watch:
- https://medium.com/ergonode/microservices-approach-in-a-typical-vue-application-e07544b6f9a1
- https://medium.com/bb-tutorials-and-thoughts/how-to-implement-micro-frontend-architecture-with-vue-js-da295ff2ce66
- https://dev.to/ifarhad/implement-nuxt-vue-micro-service-1oo1
- https://www.youtube.com/watch?v=y69VDOczkik (2x speed)


Thank you Michael Gallagher & Jamie Curnow
- https://medium.com/dailyjs/5-tips-for-sharing-code-between-nuxtjs-projects-6ffb5b7f8a25
- https://medium.com/carepenny/creating-a-nuxt-module-1c6e3cdf1037
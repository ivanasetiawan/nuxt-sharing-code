// Nuxt exposes its default route builder logic here
import { createRoutes, relativeTo } from '@nuxt/utils'
import path from 'path'
import serveStatic from 'serve-static'

// If too many pages, might be worth considering a folder pass to dynamically create this list
const pages = ['pages/login.vue', 'pages/componentPage.vue']
export default function NuxtModule() {
  const { routeNameSplitter, trailingSlash } = this.options.router

  // PAGES
  // Nuxt modules have a convenient extendRoutes helper exposed, coupling this with the Nuxt page-to-route generation (createRoutes), 
  // the code to inject the page routes is short and straight-forward.
  this.extendRoutes((routes) => {
    routes.push(...createRoutes({
      files: pages,
      srcDir: __dirname,
      pagesDir: 'pages',
      routeNameSplitter,
      trailingSlash,
    }))
  })

  // LAYOUT
  // Here we are using a hook to provide layouts at the right time in the build process. 
  // The layoutPath function will provide a path to the dependency layout files relative to the project build directory.
  const layoutPath = (file) =>
  relativeTo(
    this.options.buildDir,
    path.resolve(__dirname, 'layouts', file),
  )

  this.nuxt.hook('build:templates', ({ templateVars }) => {
    templateVars.layouts.default = layoutPath('default.vue')
  })

  // STATIC CONTENT
  this.addServerMiddleware(
    serveStatic(path.resolve(__dirname, 'static')),
  )

  // COMPONENT ~ see const pages = ['pages/componentPage.vue']
  this.nuxt.hook('components:dirs', (dirs) => {
    dirs.unshift({
      path: path.resolve(__dirname, 'components'),
      level: 1, // provide a priority
    })
  })
}
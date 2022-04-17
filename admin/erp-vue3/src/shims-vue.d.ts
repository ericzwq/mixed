/* eslint-disable */
declare module '*.vue' {
  import type {DefineComponent} from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// declare module 'lazy-load-vue3' {
//   import LazyLoad from 'lazy-load-vue3'
//   // export {
//   //   listener,
//   //   config
//   // }
//   export default LazyLoad
// }

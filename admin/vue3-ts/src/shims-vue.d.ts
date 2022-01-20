/* eslint-disable */
declare module '*.vue' {
  // import type { DefineComponent } from 'vue'
  // const component: DefineComponent<{}, {}, any>
  // export default component
  import Vue from 'vue';
  export default Vue;
}

declare module 'lazy-load-vue3' {
  export {
    listener,
    config
  }
  import LazyLoad from 'lazy-load-vue3'
  export default LazyLoad
}

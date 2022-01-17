import {App} from "vue";
import Lazy, {config} from "./Lazy";
import {LazyConfig} from "@/components/LazyLoad/types";

export default {
  install(app: App, options: LazyConfig): void {
    Object.assign(config, options)
    app.component('lazy-component', Lazy)
    app.directive('lazy', {
      beforeMount(el, binding) {
        el['data-src'] = binding.value
      },
      mounted(el, binding) {
        console.log('mounted', arguments)
      },
      updated(el) {
        el.src = el['data-src']
        console.log('updated', arguments)
      },
      beforeUnmount() {
        console.log('before unmount', arguments)
      }
    })
  }
}

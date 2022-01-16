import {App} from "vue";
import Lazy, {config} from "./Lazy";
import {LazyConfig} from "@/components/LazyLoad/types";

export default {
  install(app: App, options: LazyConfig): void {
    Object.assign(config, options)
    app.component('lazy-component', Lazy)
    // app.directive('lazy', {
    //   beforeMount() {
    //     console.log('before mount', arguments)
    //   },
    //   mounted() {
    //     console.log('mounted', arguments)
    //   },
    //   updated() {
    //     console.log('updated', arguments)
    //   },
    //   beforeUnmount() {
    //     console.log('before unmount', arguments)
    //   }
    // })
  }
}

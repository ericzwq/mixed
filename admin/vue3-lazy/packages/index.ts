import {App} from "vue";
import LazyComponent from "./LazyComponent";
import {LazyOptions} from "./types";
import LazyDirective from "./LazyDirective";
import {config} from "./listen";

export default {
  install(app: App, options: LazyOptions): void {
    Object.assign(config, options)
    if (config.component) app.component('lazy-component', LazyComponent)
    app.directive('lazy', LazyDirective)
  }
}

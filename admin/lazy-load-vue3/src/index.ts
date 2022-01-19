import {App} from "vue";
import LazyComponent from "./LazyComponent";
import {LazyOptions} from "./types";
import LazyDirective from "./LazyDirective";
import {baseConfig, config, directiveConfig} from "./listen";

export {listener, config} from './listen'
export default {
  install(app: App, {loading, loadingClassList, error, errorClassList, preLoad, timeout, component}: LazyOptions = {}): void {
    baseConfig.loading = loading || ''
    baseConfig.loadingClassList = loadingClassList || []
    baseConfig.error = error || ''
    baseConfig.errorClassList = errorClassList || []
    Object.assign(config, baseConfig)
    config.preLoad = preLoad || 0.3
    config.timeout = timeout || 200
    config.component = component || false
    Object.assign(directiveConfig, baseConfig)
    if (config.component) app.component('lazy-component', LazyComponent)
    app.directive('lazy', LazyDirective)
  }
}

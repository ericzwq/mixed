import { App } from "vue";
import { LazyOptions } from "./types";
export { listener, config } from './listen';
declare const _default: {
    install(app: App, { loading, loadingClassList, error, errorClassList, preLoad, timeout, component }?: LazyOptions): void;
};
export default _default;

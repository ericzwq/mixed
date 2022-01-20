import { ComponentPublicInstance } from "vue";
export interface LooseObject {
    [k: string]: any;
}
export interface BaseConfig {
    error: string;
    loading: string;
    errorClassList: Array<string>;
    loadingClassList: Array<string>;
}
export interface Config extends BaseConfig {
    timeout: number;
    preLoad: number;
    component: boolean;
}
export declare type LazyOptions = Partial<Config>;
export interface DirectiveConfig extends BaseConfig {
    lazyKey: string;
    src: string;
}
export interface ExtComponentPublicInstance extends ComponentPublicInstance {
    loaded: boolean;
}
export interface ExtHTMLElement extends HTMLElement {
    lazy?: DirectiveConfig;
}
export declare const enum Status {
    loading = "loading",
    error = "error",
    loaded = "loaded"
}

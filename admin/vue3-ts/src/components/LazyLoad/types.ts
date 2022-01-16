import {ComponentPublicInstance} from "vue";

export interface LazyConfig {
  timeout?: number
  preLoad?: number
}

export interface LazyProps {
  lazyKey: string
}

export interface ExtComponentPublicInstance extends ComponentPublicInstance {
  loaded: boolean
}

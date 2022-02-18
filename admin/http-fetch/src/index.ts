import {
  HttpFetchConfig,
  HttpFetchInstance,
  HttpFetchParameterConfig,
  HttpFetch,
} from "./types";
import interceptor from "./interceptor";
import request from './request'
import {deepClone} from "@/utils";

function handler<T = unknown>(this: HttpFetchInstance, urlOrConfig: string | HttpFetchParameterConfig, config: HttpFetchParameterConfig = {}): Promise<T> {
  let url: string | undefined
  if (typeof urlOrConfig === 'string') {
    url = urlOrConfig
  } else {
    config = urlOrConfig
    url = config.url
  }
  Object.keys(this.config).forEach(k => k in config ? 0 : config[k] = deepClone(this.config[k]))
  config.url = url
  return interceptor(this.interceptors.request.handlers, request, this.interceptors.response.handlers, config as HttpFetchConfig)
}

const Fetch = function (urlOrConfig: string | HttpFetchParameterConfig, config?: HttpFetchParameterConfig) {
  return handler.call(Fetch, urlOrConfig, config)
} as HttpFetch

Fetch.config = {
  timeout: 0,
  headers: {}
}

Fetch.interceptors = {
  request: {
    use(onFulfilled, onRejected) {
      return this.handlers.push(onFulfilled, onRejected)
    },
    handlers: []
  },
  response: {
    use(onFulfilled, onRejected) {
      return this.handlers.push(onFulfilled, onRejected)
    },
    handlers: []
  }
}

Fetch.create = function (config: HttpFetchParameterConfig = {}): HttpFetchInstance {
  const fetchInstance = function (urlOrConfig: string | HttpFetchParameterConfig, config?: HttpFetchParameterConfig) {
    return handler.call(fetchInstance, urlOrConfig, config)
  } as HttpFetchInstance

  Object.keys(this).forEach(k => {
    if (k === 'create') return
    const v = this[k];
    (fetchInstance[k] as typeof v) = v
  })
  Object.keys(this.config).forEach(k => k in config ? 0 : config[k] = deepClone(this.config[k]))
  fetchInstance.config = config as HttpFetchConfig
  return fetchInstance
}

;(['post', 'put', 'patch'] as const).forEach(method => {
  (Fetch as HttpFetch)[method] = function <T>(url: string, data?: HttpFetchParameterConfig['data'], config: HttpFetchParameterConfig = {}): Promise<T> {
    config.method = method
    config.data = data
    return handler.call<HttpFetch, [string, HttpFetchParameterConfig], Promise<T>>(this, url, config)
  }
})

;(['get', 'delete', 'options', 'head'] as const).forEach(method => {
  (Fetch as HttpFetch)[method] = function <T>(url: string, params?: HttpFetchParameterConfig['params'], config: HttpFetchParameterConfig = {}): Promise<T> {
    config.method = method
    config.params = params
    return handler.call<HttpFetch, [string, HttpFetchParameterConfig], Promise<T>>(this, url, config)
  }
})

export default Fetch

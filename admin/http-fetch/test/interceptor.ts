import {HttpFetchInstance} from "../src/types";
import Fetch from "../src/index";

// normalRequestInterceptor(Fetch)

// normalRequestInterceptor(Fetch.create())

function normalRequestInterceptor(Fetch: HttpFetchInstance) {
  Fetch.interceptors.request.use(config => {
    config.method = 'post'
    return config
  })
  Fetch.interceptors.request.use(config => {
    (config.headers as any).token = '.token'
    return config
  })
  Fetch.put('')
  console.warn('expected method: POST, headers: {token: \'.token\'}')
}

// error request interceptor
// errorRequestInterceptor(Fetch)
// errorRequestInterceptor(Fetch.create())

function errorRequestInterceptor(Fetch: HttpFetchInstance) {
  Fetch.interceptors.request.use(config => Promise.reject(config))
  Fetch.interceptors.request.use(config => {
    console.error('should not in')
    return config
  }, e => {
    console.log('should in', e)
    return Promise.reject(e)
  })
  Fetch.delete('/').then(r => console.error('should not in'), e => console.log('should in', e))
}

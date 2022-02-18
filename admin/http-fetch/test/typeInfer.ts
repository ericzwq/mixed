import Fetch from "../src/index";
import {HttpFetchConfig, HttpFetchInstance} from "../src/types";

// normal(Fetch)
withInterceptor(Fetch)

function normal(Fetch: HttpFetchInstance) {
  Fetch.post<{ ok: string }>('http://localhost:3000').then(r => {
    console.log(r.ok)
  })
}


function withInterceptor(Fetch: HttpFetchInstance) {
  interface ExtHttpFetchConfig extends HttpFetchConfig {
    t: number
  }

  Fetch.interceptors.request.use<ExtHttpFetchConfig>(config => {
    config.t = 1
    return config
  }, (e: number) => e)

  Fetch.interceptors.request.use<ExtHttpFetchConfig>(config => {
    console.log('interceptor request', config.t)
    return config
  })
  Fetch.interceptors.response.use((data: { ok: string }, config) => {
    return {data, config}
  })
  Fetch<{ data: { ok: string }, config: HttpFetchConfig }>('http://localhost:3000?a=1', {params: {b: 3}}).then(r => {
    console.log(r.data)
    console.log(r.config)
  }, (e: string) => e)
}

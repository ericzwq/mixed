import {FetchJsOption, ContentType, FetchJsInstance, FetchJS, FetchJsConfig, FetchJsParameter, OmitFetchJsConfig, Progress} from "./types";
import {unionUint8Array} from "./utils";

function request<T = any>(this: any, urlOrConfig: string | FetchJsConfig, config?: FetchJsConfig): Promise<T> {
  let url: string | undefined, search = ''
  if (typeof urlOrConfig === 'string') {
    url = urlOrConfig
  } else {
    config = urlOrConfig
    url = config.url
  }
  if (!url) throw new Error('The url is invalid')
  const option: FetchJsOption = Object.assign(this.option, config)
  // option.method = method
  const {data, params} = option
  if (params != undefined) search = '?' + new URLSearchParams(params)
  if (data != undefined) {
    if (Object.prototype.toString.call(data).includes('Object')) { // json
      option.body = JSON.stringify(data)
      option.headers['Content-Type'] = ContentType.json
    } else option.body = data as BodyInit
  }
  const controller = option.controller || new AbortController()
  option.signal = controller.signal
  setTimeout(() => handleTimeout(controller), option.timeout)
  if (!url.startsWith('http') && option.base) url = option.base + url

  return new Promise<T>((async (resolve, reject) => {
    try {
      const res = await fetch(url + search, option)
      if (res.body) {
        const reader = res.body.getReader()
        const chunks: Uint8Array[] = []
        const total = +(res.headers.get('Content-Length') || 0)
        const progress: Progress = {
          total,
          loaded: 0
        }
        while (true) {
          const {done, value} = await reader.read()
          if (done) break
          chunks.push(value as Uint8Array)
          progress.loaded += (value as Uint8Array).length
          option.onDownloadProgress && option.onDownloadProgress(progress)
        }
        let data
        switch (option.responseType) {
          case 'blob':
            data = new Blob(chunks)
            break
          case 'arrayBuffer':
            data = unionUint8Array(chunks, progress.loaded).buffer
            break
          case 'text':
            data = new TextDecoder('utf-8').decode(unionUint8Array(chunks, progress.loaded))
            break
          default:
            data = new TextDecoder('utf-8').decode(unionUint8Array(chunks, progress.loaded))
            try {
              data = JSON.parse(data)
            } catch (e) {
            }
        }
        // console.log({data})
        resolve(data)
      } else {
        resolve(null as unknown as T)
      }
    } catch (e) {
      console.log('e1', e)
    }
    // fetch(url + search, option).then(r => {
    //   console.log('r1', r)
    //   if (!r.ok) return reject(r)
    //   if (['arrayBuffer', 'blob', 'formData', 'json', 'text'].includes(option.responseType as TransformMethod)) return r[option.responseType as TransformMethod]()
    //   return r.text()
    // }, e => console.log('e1', e)).then(r => {
    //   // console.log('r2', r)
    //   if (!option.responseType) {
    //     try {
    //       resolve(JSON.parse(r))
    //     } catch (e) {
    //       resolve(r)
    //     }
    //   } else resolve(r)
    // }, e => console.log('e2', e))
  }))
}

const Fetch = function (url: string, config: FetchJsConfig) {
  return request.call(Fetch, url, config)
} as FetchJS

Fetch.create = function (config: FetchJsConfig = {}) {
  const fetchInstance = function (url: string, config: FetchJsConfig) {
    return request.call(fetchInstance, url, config)
  } as FetchJsInstance
  Object.keys(Fetch).forEach(k => {
    if (k === 'create') return
    const v = Fetch[k];
    (fetchInstance[k] as typeof v) = v
  })
  fetchInstance.option = Object.assign(Fetch.option, config)
  return fetchInstance
}

const defaultConfig: FetchJsOption = {
  timeout: 10000,
  headers: {}
}

Fetch.option = defaultConfig

;(['get', 'post', 'put', 'delete', 'options', 'head', 'trace', 'connect'] as const).forEach(method => {
  Fetch[method] = function <T>(url: string, parameter: FetchJsParameter = {}, config: OmitFetchJsConfig = {}): any {
    config.method = method
    return request.call(this, url, Object.assign(parameter, config))
  }
})

function handleTimeout(controller: AbortController) {
  controller.abort()
}

export default Fetch

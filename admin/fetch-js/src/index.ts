import {
  FetchJsOption,
  ContentType,
  FetchJsInstance,
  FetchJsConfig,
  FetchJsParameter,
  OmitFetchJsConfig,
  Progress,
  FetchJs,
  TransformMethod
} from "./types";

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
  if (!url.startsWith('http') && option.base) url = option.base + url

  return new Promise<T>(async (resolve, reject) => {
    if (option.timeout) setTimeout(() => handleTimeout(controller, reject, option), option.timeout)
    try {
      const res = await fetch(url + search, option)
      if (!res.ok) return reject(res)
      if (res.body) {
        const reader = res.body.getReader()
        const total = +(res.headers.get('Content-Length') || 0)
        const progress: Progress = {
          total,
          loaded: 0
        }
        const stream: ReadableStream = new ReadableStream({
          start: async function (controller) {
            try {
              while (true) {
                const {done, value} = await reader.read()
                if (done) break
                controller.enqueue(value)
                progress.loaded += (value as Uint8Array).length
                option.onDownloadProgress && option.onDownloadProgress(progress)
              }
            } catch (e) {
              // handle user aborted
              return reject(e)
            }
            controller.close()
            if (option.responseType === 'stream') return resolve(stream as unknown as T)
            let response
            try {
              if (['json', 'blob', 'text', 'arrayBuffer', 'formData'].includes(option.responseType as string)) {
                response = await new Response(stream)[option.responseType as TransformMethod]()
              } else {
                response = await new Response(stream).text()
                try {
                  response = JSON.parse(response)
                } catch (e) {
                }
              }
            } catch (e) {
              return reject(new Error('Response parse error'))
            }
            resolve(response)
          }
        })
      } else {
        resolve(null as unknown as T)
      }
    } catch (e) {
      // user aborted will in, timeout will in but the promise is already be rejected
      reject(e)
    }
  })
}

const Fetch = function (url: string | FetchJsConfig, config?: FetchJsConfig) {
  return request.call(Fetch, url, config)
} as FetchJs

Fetch.create = function (config: FetchJsConfig = {}): FetchJsInstance {
  const fetchInstance = function (urlOrConfig: string | FetchJsConfig, config?: FetchJsConfig) {
    return request.call(fetchInstance, urlOrConfig, config)
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
  timeout: 3000,
  headers: {}
}

Fetch.option = defaultConfig

;(['get', 'post', 'put', 'delete', 'options', 'head', 'trace', 'connect'] as const).forEach(method => {
  (Fetch as FetchJs)[method] = function <T>(url: string, parameter: FetchJsParameter = {}, config: OmitFetchJsConfig = {}): Promise<T> {
    config.method = method
    return request.call<FetchJs, [string, FetchJsConfig], Promise<T>>(this, url, Object.assign(parameter, config))
  }
})

function handleTimeout(controller: AbortController, reject: (reason?: any) => void, option: FetchJsOption) {
  controller.abort()
  console.warn('timeout')
  reject(`timeout of ${option.timeout}ms exceeded`)
}

export default Fetch

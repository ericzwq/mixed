import {
  HttpFetchConfig,
  HttpFetchInterceptorRequestHandler,
  HttpFetchInterceptorResponseHandler,
  HttpFetchResponseResolver,
  HttpFetchResponseRejecter
} from "./types";

export default function interceptor<T>(
  reqInterceptors: HttpFetchInterceptorRequestHandler[],
  request: <T>(init: HttpFetchConfig) => Promise<T>,
  resInterceptors: HttpFetchInterceptorResponseHandler[],
  config: HttpFetchConfig
): Promise<T> {
  const response: Promise<T> = handleRequestInterceptors2(Promise.resolve(config), reqInterceptors).then(_config => request(config = _config))
  return handleResponseInterceptors2(response, resInterceptors, config)
}

function handleRequestInterceptors2(promise: Promise<HttpFetchConfig>, interceptors: HttpFetchInterceptorRequestHandler[], i = 0): Promise<HttpFetchConfig> {
  if (i === interceptors.length) return promise
  return handleRequestInterceptors2(promise.then(interceptors[i], interceptors[++i]), interceptors, i + 1)
}

// function handleRequestInterceptors(status: 'resolve' | 'reject', interceptors: (HttpFetchRequestResolver | HttpFetchRequestRejecter)[], config: HttpFetchConfig, i = 0): Promise<HttpFetchConfig> {
//   const method = status === 'resolve' ? Promise.resolve.bind(Promise) : Promise.reject.bind(Promise)
//   if (i === interceptors.length) return method(config)
//   const onFulfilled = interceptors[i] || (() => config)
//   const onRejected = interceptors[++i] as HttpFetchRequestRejecter
//   const handler = status === 'resolve' ? onFulfilled : onRejected
//   return method<HttpFetchConfig>(handler(config)).then<HttpFetchConfig, HttpFetchConfig>(
//     (config) => handleRequestInterceptors('resolve', interceptors, config, i + 1),
//     (reason) => handleRequestInterceptors('reject', interceptors, reason, i + 1)
//   )
// }

// function f<T = 'req' | 'res', R = T extends 'req' ? HttpFetchConfig : unknown>(status: 'resolve' | 'reject', interceptors: (HttpFetchRequestResolver | HttpFetchRequestRejecter)[], config: R, i = 0): Promise<R> {
//   const method = status === 'resolve' ? Promise.resolve.bind(Promise) : Promise.reject.bind(Promise)
//   if (i === interceptors.length) return method(config)
//   const onFulfilled = interceptors[i] || (() => config)
//   const onRejected = interceptors[++i] as any
//   const handler = status === 'resolve' ? onFulfilled : onRejected
//   return method<R>(handler(config as any)).then<R, R>(
//     (config) => f('resolve', interceptors, config, i + 1),
//     (reason) => f('reject', interceptors, reason, i + 1)
//   )
// }

function handleResponseInterceptors2<T>(promise: Promise<T>, interceptors: HttpFetchInterceptorResponseHandler[], config: HttpFetchConfig, i = 0): Promise<T> {
  if (i === interceptors.length) return promise
  const handler = interceptors[i] as HttpFetchResponseResolver
  return handleResponseInterceptors2(promise.then(data => typeof handler === 'function' ? handler(data, config) : data, interceptors[++i] as HttpFetchResponseRejecter), interceptors, config, i + 1)
}

// function handleResponseInterceptors<T>(interceptors: (HttpFetchResponseHandler | resErr)[], data: unknown, config: HttpFetchConfig, i = 0): Promise<T> {
//   if (i === interceptors.length) return Promise.resolve(data as T)
//   const onFulfilled = interceptors[i] || (() => data) as HttpFetchResponseHandler
//   const onRejected = interceptors[++i] as resErr
//   return Promise.resolve<unknown>(onFulfilled(data, config)).then<unknown, any>(data => handleResponseInterceptors(interceptors, data, config, i + 1), onRejected)
// }

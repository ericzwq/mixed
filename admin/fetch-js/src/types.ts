export interface LooseObject {
  [k: string]: any
}

export interface FetchJsParameter {
  // data?: Record<string, unknown> | string
  data?: BodyInit | Record<string, any> | Array<any>
  params?: URLSearchParams
}

export type OmitFetchJsConfig = Omit<FetchJsConfig, keyof FetchJsParameter>
export type RequestFunction = <T>(url: string, parameter?: FetchJsParameter, config?: OmitFetchJsConfig) => Promise<T>

export interface FetchJsInstance {
  <T>(url: string, config?: FetchJsConfig): Promise<T>; // Omit<FetchJsConfig, 'url'>

  <T>(config: FetchJsConfig): Promise<T>;

  option: FetchJsOption
  get: RequestFunction
  post: RequestFunction
  put: RequestFunction
  delete: RequestFunction
  options: RequestFunction
  head: RequestFunction
  trace: RequestFunction
  connect: RequestFunction
}

export interface FetchJs extends FetchJsInstance {
  create(config: FetchJsOption): FetchJsInstance
}

export type TransformMethod = 'arrayBuffer' | 'blob' | 'json' | 'text' | 'formData'

export type FetchJsResponseType = TransformMethod | 'stream'

export interface Progress {
  total: number
  loaded: number
}

export interface FetchJsOption extends RequestInit {
  url?: string
  base?: string
  params?: FetchJsParameter['params']
  data?: FetchJsParameter['data']
  timeout: number
  controller?: AbortController
  responseType?: FetchJsResponseType
  headers: HeadersInit & { 'Content-Type'?: string }
  onDownloadProgress?: (progress: Progress) => void
}

export type FetchJsConfig = Partial<FetchJsOption>

export enum ContentType {
  json = 'application/json',
  formData = 'multipart/form-data',
  urlencoded = 'application/x-www-from-urlencoded'
}

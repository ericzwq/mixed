export declare type HttpFetchDataRequestFn = <T>(url: string, data?: HttpFetchParameterConfig['data'], config?: Omit<HttpFetchParameterConfig, 'data'>) => Promise<T>;
export declare type HttpFetchParamsRequestFn = <T>(url: string, params?: HttpFetchParameterConfig['params'], config?: Omit<HttpFetchParameterConfig, 'params'>) => Promise<T>;
export interface HttpFetchRequestResolver<T = HttpFetchConfig, R = HttpFetchConfig> {
    (config: T): Promise<R> | R;
}
export interface HttpFetchRequestRejecter<R = any> {
    (reason?: any): Promise<R> | R;
}
export interface HttpFetchResponseResolver<T = any, R = any> {
    (data: T, config: HttpFetchConfig): Promise<R> | R;
}
export interface HttpFetchResponseRejecter<R = HttpFetchResponseError> {
    (reason: HttpFetchResponseError): Promise<R> | R;
}
export declare type HttpFetchInterceptorRequestHandler = HttpFetchRequestResolver | HttpFetchRequestRejecter | undefined;
export declare type HttpFetchInterceptorResponseHandler = HttpFetchResponseResolver | HttpFetchResponseRejecter | undefined;
export interface HttpFetchInstance {
    <R>(url: string, config?: HttpFetchParameterConfig): Promise<R>;
    <R>(config: HttpFetchParameterConfig): Promise<R>;
    config: HttpFetchConfig;
    get: HttpFetchParamsRequestFn;
    delete: HttpFetchParamsRequestFn;
    options: HttpFetchParamsRequestFn;
    head: HttpFetchParamsRequestFn;
    post: HttpFetchDataRequestFn;
    put: HttpFetchDataRequestFn;
    patch: HttpFetchDataRequestFn;
    interceptors: {
        request: {
            use: <T = HttpFetchConfig, R = HttpFetchConfig>(onFulfilled?: HttpFetchRequestResolver<R, T>, onRejected?: HttpFetchRequestRejecter) => number;
            handlers: HttpFetchInterceptorRequestHandler[];
        };
        response: {
            use: (onFulfilled?: (HttpFetchResponseResolver), onRejected?: HttpFetchResponseRejecter) => number;
            handlers: HttpFetchInterceptorResponseHandler[];
        };
    };
}
export interface HttpFetch extends HttpFetchInstance {
    create(config?: HttpFetchParameterConfig): HttpFetchInstance;
}
export declare type TransformMethod = 'arrayBuffer' | 'blob' | 'json' | 'text' | 'formData';
export declare type HttpFetchResponseType = TransformMethod | 'stream';
export interface Progress {
    total: number;
    loaded: number;
}
export declare type HttpFetchHttpMethod = 'get' | 'post' | 'put' | 'delete' | 'options' | 'head' | 'patch' | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'PATCH';
export interface HttpFetchConfig extends RequestInit {
    url?: string;
    base?: string;
    data?: BodyInit | Record<string, unknown> | Array<unknown> | number | boolean | null;
    params?: unknown;
    timeout: number;
    method?: HttpFetchHttpMethod;
    controller?: AbortController;
    responseType?: HttpFetchResponseType;
    headers: HeadersInit & {
        'Content-Type'?: string;
    };
    onDownloadProgress?: (progress: Progress) => void;
}
export declare type HttpFetchParameterConfig = Partial<HttpFetchConfig>;
export declare enum ContentType {
    json = "application/json",
    formData = "multipart/form-data",
    urlencoded = "application/x-www-from-urlencoded"
}
export interface HttpFetchResponseError extends Error {
    config?: HttpFetchConfig;
    response?: Response;
    data?: unknown;
}

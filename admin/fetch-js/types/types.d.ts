export interface LooseObject {
    [k: string]: any;
}
export interface FetchJsParameter {
    data?: BodyInit | Record<string, any> | Array<any>;
    params?: URLSearchParams;
}
export declare type OmitFetchJsConfig = Omit<FetchJsConfig, keyof FetchJsParameter>;
export declare type RequestFunction = <T>(url: string, parameter?: FetchJsParameter, config?: OmitFetchJsConfig) => Promise<T>;
export interface FetchJsInstance {
    (url: string, config?: FetchJsConfig): Promise<any>;
    (config: FetchJsConfig): Promise<any>;
    option: FetchJsOption;
    get: RequestFunction;
    post: RequestFunction;
    put: RequestFunction;
    delete: RequestFunction;
    options: RequestFunction;
    head: RequestFunction;
    trace: RequestFunction;
    connect: RequestFunction;
}
export interface FetchJs {
    (url: string, config?: FetchJsConfig): any;
    (config: FetchJsConfig): any;
    option: FetchJsOption;
    get: RequestFunction;
    post: RequestFunction;
    put: RequestFunction;
    delete: RequestFunction;
    options: RequestFunction;
    head: RequestFunction;
    trace: RequestFunction;
    connect: RequestFunction;
    create(config: FetchJsOption): FetchJsInstance;
}
export declare type ResponseType = 'arrayBuffer' | 'blob' | 'json' | 'text';
export interface Progress {
    total: number;
    loaded: number;
}
export interface FetchJsOption extends RequestInit {
    url?: string;
    base?: string;
    params?: FetchJsParameter['params'];
    data?: FetchJsParameter['data'];
    timeout: number;
    controller?: AbortController;
    responseType?: ResponseType;
    headers: HeadersInit & {
        'Content-Type'?: string;
    };
    onDownloadProgress?: (progress: Progress) => void;
}
export declare type FetchJsConfig = Partial<FetchJsOption>;
export declare enum ContentType {
    json = "application/json",
    formData = "multipart/form-data",
    urlencoded = "application/x-www-from-urlencoded"
}

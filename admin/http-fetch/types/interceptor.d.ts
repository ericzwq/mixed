import { HttpFetchConfig, HttpFetchInterceptorRequestHandler, HttpFetchInterceptorResponseHandler } from "./types";
export default function interceptor<T>(reqInterceptors: HttpFetchInterceptorRequestHandler[], request: <T>(init: HttpFetchConfig) => Promise<T>, resInterceptors: HttpFetchInterceptorResponseHandler[], config: HttpFetchConfig): Promise<T>;

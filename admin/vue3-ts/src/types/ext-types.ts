// 扩展type
import {AxiosRequestConfig} from "axios";

// const service = ElLoading.service()
// export type LoadingReturnValue = typeof service & { MANUAL?: boolean }
export type ExtAxiosRequestConfig = AxiosRequestConfig & { noLoading?: boolean }
// export type ExtLoadingOptionsResolved = Partial<LoadingOptionsResolved> & { MANUAL: boolean }

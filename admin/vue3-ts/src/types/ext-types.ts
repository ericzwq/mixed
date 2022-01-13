// 扩展type
import {AxiosRequestConfig} from "axios";
import {ElLoading} from "element-plus";

// const service = ElLoading.service()
// export type LoadingReturnValue = typeof service & { MANUAL?: boolean }
export type ExtAxiosRequestConfig = AxiosRequestConfig & { noLoading?: boolean }
// export type ExtLoadingOptionsResolved = Partial<LoadingOptionsResolved> & { MANUAL: boolean }

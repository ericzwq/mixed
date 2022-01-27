// 动态属性对象
export interface LooseObject {
  [key: string]: any
}

// 成功响应的结构
export interface SuccessResponse<T = any> {
  code: number,
  msg: string,
  data: T,
  total: number
}

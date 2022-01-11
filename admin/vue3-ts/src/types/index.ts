// 动态属性对象
export interface LooseObject {
  [key: string]: any
}

// 请求响应
export interface Response {
  code: number,
  msg: string,
  data: any
}

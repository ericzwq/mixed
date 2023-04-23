interface SocketResponse<T = any> {
  status: number
  message: string
  data: T
  action: string
}
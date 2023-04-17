interface SocketResponse<T = Message[]> {
  status: number
  message: string
  data: T
  action: string
}
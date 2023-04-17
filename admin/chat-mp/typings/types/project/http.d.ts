interface HttpResponse<T = null> {
  message: string
  status: number
  data: T
  totalCount?: number
}
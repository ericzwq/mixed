export class ResponseSchema {
  message: string
  status: number
  data?: any
  totalCount?: number


  constructor({message, status, data, totalCount}: { message?: string, status?: number, data?: any, totalCount?: number } = {}) {
    this.message = message || '查询成功'
    this.status = status || 0
    this.data = data
    this.totalCount = totalCount
  }
}

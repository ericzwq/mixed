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

export interface SocketResponseOptions {
  data?: any,
  message?: string,
  status?: number,
  action?: string
}

export class SocketResponseSchema {
  data
  message
  status
  action

  constructor({data, message = '', status = 0, action}: SocketResponseOptions) {
    this.data = data
    this.message = message
    this.status = status
    this.action = action
  }
}

import {DOMAIN, PORT, WS_PROTOCOL} from "../consts/consts"
import {LoginPath} from "../consts/routes"

export const chatSocket = createSocket()
export const voiceSocket = createSocket()

function createSocket() {
  return {
    connected: false,
    url: '',
    connTime: 0,
    timeout: 10000,
    shouldClose: false,
    socketTask: null as unknown as WechatMiniprogram.SocketTask,
    connect(url = '') {
      return new Promise<void>(resolve => {
        this.shouldClose = false
        if (this.connected) return
        if (Date.now() - this.connTime < this.timeout) return
        console.log('socket连接', url)
        this.url = url
        const header = {} as { cookie: string }
        const cookie = wx.getStorageSync('cookies')
        header.cookie = cookie
        const socketTask = wx.connectSocket({
          url: `${WS_PROTOCOL}://${DOMAIN}:${PORT}/${url}?cookie=${encodeURIComponent(cookie)}`,
          header,
          success() {
          }
        })
        this.socketTask = socketTask
        socketTask.onOpen(r => {
          console.log('open 建立socket连接', url, r)
          this.connected = true
          resolve()
        })
        socketTask.onError(r => {
          this.connected = false
          wx.showToast({title: '网络异常', duration: 2000, icon: 'error'})
          console.log('error socket连接异常', r)
          setTimeout(() => resolve(this.connect(this.url)), this.timeout);
        })
        socketTask.onMessage(async ({data}) => {
          let obj = {} as SocketResponse<unknown>
          try {
            obj = JSON.parse(data as string)
          } catch (e) {
          }
          if (obj.status !== 0) {
            if (obj.status === 401) {
              this.close('未登录关闭连接')
              wx.navigateTo({url: LoginPath})
            } else {
              wx.showToast({
                title: obj.message || '网络异常',
                duration: 2000,
                icon: "error"
              })
            }
            const handlers = this._actionErrorHandlersMap[obj.action] || []
            for (const handler of handlers) handler(obj)
          } else {
            const handlers = this._actionSuccessHandlersMap[obj.action] || []
            for (const handler of handlers) await handler(obj)
          }
        })
        socketTask.onClose(r => {
          console.log('close socket连接关闭', url, r)
          this.connected = false
          if (!this.shouldClose) setTimeout(() => resolve(this.connect(this.url)), this.timeout);
        })
        this.connTime = Date.now()
      })
    },
    addErrorHandler<T>(action: string, handler: (p: SocketResponse<T>) => void) {
      const handlers = this._actionErrorHandlersMap[action] || []
      handlers.push(handler)
      this._actionErrorHandlersMap[action] = handlers
    },
    addSuccessHandler<T>(action: string, handler: (p: SocketResponse<T>) => void, index?: number) {
      const handlers = this._actionSuccessHandlersMap[action] || []
      index === undefined ? handlers.push(handler) : handlers[index] = handler
      this._actionSuccessHandlersMap[action] = handlers
    },
    removeSuccessHandler(action: string, handler: (p: SocketResponse) => void) {
      const handlers = this._actionSuccessHandlersMap[action] || []
      const index = handlers.findIndex(_handler => _handler === handler)
      if (index > -1) handlers.splice(index, 1)
    },
    removeErrorHandler(action: string, handler: (p: SocketResponse) => void) {
      const handlers = this._actionErrorHandlersMap[action] || []
      const index = handlers.findIndex(_handler => _handler === handler)
      if (index > -1) handlers.splice(index, 1)
    },
    _actionErrorHandlersMap: {} as { [key in string]: Array<(p: SocketResponse) => void> },
    _actionSuccessHandlersMap: {} as { [key in string]: Array<(p: SocketResponse) => void> },
    close(reason?: string) {
      this.shouldClose = true
      console.log('关闭socket连接', reason)
      this.socketTask && this.socketTask.close({reason})
      this.connected = false
    },
    send<T = any>(data: { action: string, data?: T }) {
      return new Promise<void>((resolve, reject) => {
        this.socketTask.send({
          data: JSON.stringify(data),
          fail(e) {
            console.log(e)
            wx.showToast({
              title: '发送失败',
              duration: 2000,
              icon: 'error'
            })
            reject(e)
          },
          success: () => resolve()
        })
      })
    }
  }
}

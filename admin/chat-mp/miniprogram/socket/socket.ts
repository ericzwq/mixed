import {
  DOMAIN, PORT
} from "../consts/consts"
import { LoginPath } from "../consts/routes"

export const chatSocket = createSocket()
export const voiceSocket = createSocket()

function createSocket() {
  let connected = false
  return {
    socketTask: null as unknown as WechatMiniprogram.SocketTask,
    connect(url = '') {
      if (connected) return
      const header = {} as { cookie: string }
      const cookie = wx.getStorageSync('cookies')
      header.cookie = cookie
      const socketTask = wx.connectSocket({
        url: `wss://${DOMAIN}:${PORT}/${url}?cookie=${encodeURIComponent(cookie)}`,
        header,
        success() { }
      })
      this.socketTask = socketTask
      socketTask.onOpen(r => {
        console.log('建立socket连接', url, r)
        connected = true
      })
      socketTask.onError(r => {
        wx.showToast({
          title: '网络异常',
          duration: 2000,
          icon: 'error'
        })
        console.log('socket连接异常', r)
      })
      socketTask.onMessage(({
        data
      }) => {
        let obj = {} as SocketResponse
        try {
          obj = JSON.parse(data as string)
        } catch (e) { }
        if (obj.status !== 0) {
          if (obj.status === 401) {
            this.close('未登录关闭连接')
            wx.navigateTo({ url: LoginPath })
          } else {
            wx.showToast({
              title: obj.message || '网络异常',
              duration: 2000,
              icon: "error"
            })
          }
          this.errorHandlers.forEach(v => v(obj))
        } else {
          this.successHandlers.forEach(v => v(obj))
        }
      })
      socketTask.onClose(r => {
        console.log('socket连接关闭', url, r)
        connected = false
      })
    },
    errorHandlers: [] as Array<(p: SocketResponse) => void>,
    successHandlers: [] as Array<(p: SocketResponse) => void>,
    close(reason?: string) {
      console.log('关闭socket连接', reason)
      this.socketTask && this.socketTask.close({
        reason
      })
      connected = false
    },
    send(data: {}) {
      return new Promise((resolve, reject) => {
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
          success: resolve
        })
      })
    }
  }
}

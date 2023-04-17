import { DOMAIN, PORT } from "../consts/consts.js"
import { LoginPath } from "../consts/routes.js"
import { chatSocket } from "../socket/socket.js"

type Data = string | WechatMiniprogram.IAnyObject | ArrayBuffer

const request = <T>(url: string, method: 'GET' | 'POST', data?: Data, config: {} = {}) => new Promise<HttpResponse<T>>((resolve, reject) => {
  const header = {} as { cookie: string }
  header.cookie = wx.getStorageSync('cookies')
  return wx.request({
    url: `https://${DOMAIN}:${PORT}/${url}`,
    data,
    method,
    header,
    fail(e) {
      console.log(e)
      wx.showToast({
        title: '网络异常',
        duration: 2000,
        icon: 'error'
      })
      reject(e)
    },
    success(r: WechatMiniprogram.RequestSuccessCallbackResult<HttpResponse<T>>): void {
      if (r.data.status !== 0) {
        reject(r)
        if (r.data.status === 401) {
          chatSocket.close('未登录关闭连接')
          wx.navigateTo({
            url: LoginPath
          })
        } else {
          wx.showToast({
            title: r.data.message,
            duration: 2000,
            icon: "error"
          })
        }
      } else {
        if (r.cookies.length) {
          wx.setStorageSync('cookies', r.cookies.map(v => v.split(';').filter(v => !['path',
            'expires', 'httponly', 'secure'
          ].includes(v.split('=')[0].trim()))).join(';'))
        }
        resolve(r.data)
      }
    },
    ...config,
  })
})
export default {
  get: <T>(url: string, data?: Data, config?: {}) => request<T>(url, 'GET', data, config),
  post: <T>(url: string, data?: Data, config?: {}) => request<T>(url, 'POST', data, config),
}

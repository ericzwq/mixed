export function formatDate(date = new Date()) {
  const y = date.getFullYear()
  const m = date.getMonth() + 1 + ''
  const d = date.getDate() + ''
  const h = date.getHours() + ''
  const mi = date.getMinutes() + ''
  const s = date.getSeconds() + ''
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')} ${h.padStart(2, '0')}:${mi.padStart(2, '0')}:${s.padStart(2, '0')}`
}

export function formatSimpleDate(date: Date) {
  const h = date.getHours()
  return `${h >= 12 ? '下午' + (h - 12) : '上午' + h}:${date.getMinutes().toString().padStart(2, '0')}`
}

/**
 * 输入框双向绑定，需在目标输入框上设置data-bindkey属性
 * @param e 输入事件对象
 */
export function valueModel(this: WechatMiniprogram.Page.Instance<WechatMiniprogram.Page.DataOption, WechatMiniprogram.Page.CustomOption>, e: WechatMiniprogram.CustomEvent) {
  const key = e.target.dataset['bindkey']
  this.setData({ [key]: e.detail.value })
}
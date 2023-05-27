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
  this.setData({[key]: e.detail.value})
}

// 处理消息
export function handleMsg(msg: Pick<SgMsg, 'content' | 'type'>) {
  const handlers = {
    6() {
      const content = msg.content as string
      const [text, data] = content.split('/')
      const texts = text.split('#')
      const datas = data.split(',')
      let txt = ''
      for (let i = 0; i < texts.length; i++) {
        if (texts[i] === '') {
          txt += datas[i]
        } else {
          txt += decodeURIComponent(texts[i])
        }
      }
      msg.content = txt
    }
  }
  handlers[msg.type as keyof typeof handlers]?.()
}
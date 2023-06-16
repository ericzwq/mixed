Component({
  properties: {},
  data: {
    show: false,
    left: '',
    right: '',
    top: '',
    bottom: ''
  },
  methods: {
    touchMask(e: WechatMiniprogram.CustomEvent) {
      if (e.mark!['opts']) return
      this.setData({show: false})
      this.triggerEvent('close')
    },
    open(x: number, y: number) {
      const {windowHeight, windowWidth} = wx.getWindowInfo()
      const margin = (windowWidth / 375) * 10 // 设计稿为375
      this.createSelectorQuery().select('.opts').boundingClientRect(({width, height}) => {
        let left = '', right = '', top = '', bottom = ''
        x < windowWidth - width - margin ? left = x + 'px' : right = windowWidth - x + 'px'
        y < windowHeight - height - margin ? top = y + 'px' : bottom = windowHeight - y + 'px'
        this.setData({show: true, left: left || 'unset', right: right || 'unset', top: top || 'unset', bottom: bottom || 'unset'})
      }).exec()
    },
    close() {
      this.setData({show: false})
    }
  }
});

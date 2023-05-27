import {createStoreBindings} from 'mobx-miniprogram-bindings'
import {userStore} from "../../store/store"
import {BASE_URL} from '../../consts/consts'
import {ChatDetailPath} from '../../consts/routes'

Page({
  data: {
    showHoverBtn: false,
    activeIndex: -1,
    left: '',
    right: '',
    top: '',
    bottom: '',
    isActive: false,
    STATIC_BASE_URL: BASE_URL,
  },
  onTouchStart(e: WechatMiniprogram.CustomEvent) {
    this.setData({activeIndex: +e.currentTarget.dataset.i})
  },
  onTouchCancel() {
    if (this.data.isActive) return
    this.setData({activeIndex: -1})
  },
  handleLongPress(e: LongPressEvent) {
    const {x, y} = e.detail
    const {windowHeight, windowWidth} = wx.getWindowInfo()
    let left = '', right = '', top = '', bottom = ''
    x < windowWidth - 200 ? left = x + 'px' : right = windowWidth - x + 'px'
    y < windowHeight - 200 ? top = y + 'px' : bottom = windowHeight - y + 'px'
    this.setData({showHoverBtn: true, left: left || 'unset', right: right || 'unset', top: top || 'unset', bottom: bottom || 'unset', isActive: true})
    console.log({left, right, top, bottom}, e)
  },
  clickMask() {
    this.setData({showHoverBtn: false, isActive: false, activeIndex: -1})
  },
  toDetail(e: WechatMiniprogram.CustomEvent) {
    const {to, chatType} = userStore.chats[e.currentTarget.dataset.i]
    wx.navigateTo({url: ChatDetailPath + '?to=' + to + '&type=' + chatType})
  },
  storeBindings: {} as StoreBindings,
  onLoad() {
    this.storeBindings = createStoreBindings(this, {
      store: userStore,
      fields: ['chats']
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getTabBar().init()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    this.storeBindings.destroyStoreBindings()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})
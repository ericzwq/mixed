import { createStoreBindings } from 'mobx-miniprogram-bindings'
import { userStore } from "../../store/store"
import { STATIC_BASE_URL } from '../../consts/consts'
import { ChatDetailPath } from '../../consts/routes'

Page({
  data: {
    showHoverBtn: false,
    STATIC_BASE_URL,
  },
  handleLongPress() {
    this.setData({ showHoverBtn: true })
  },
  clickMask() {
    this.setData({ showHoverBtn: false })
  },
  toDetail(e: WechatMiniprogram.CustomEvent) {
    const username = userStore.chats[e.currentTarget.dataset.i].username
    wx.navigateTo({ url: ChatDetailPath + '?username=' + username + '&type=1' })
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
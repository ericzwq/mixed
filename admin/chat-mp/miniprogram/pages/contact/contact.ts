import { createStoreBindings } from 'mobx-miniprogram-bindings'
import { STATIC_BASE_URL } from '../../consts/consts'
import { NewFriendsPath, UserDetailPath } from '../../consts/routes'
import { chatSocket } from '../../socket/socket'
import { ADD_USER, REC_ADD_USER } from '../../socket/socket-actions'
import { userStore } from '../../store/store'

Page({
  data: {
    STATIC_BASE_URL,
    newFriendCount: ''
  },
  toDetail(e: WechatMiniprogram.CustomEvent) {
    const data = userStore.contacts[e.currentTarget.dataset.i]
    wx.navigateTo({ url: UserDetailPath + '?username=' + data.username })
  },
  toNewFriends() {
    wx.navigateTo({ url: NewFriendsPath })
  },
  storeBindings: {} as StoreBindings,
  receAddUserHandler: null as any,
  onLoad() {
    this.storeBindings = createStoreBindings(this, {
      store: userStore,
      fields: ['contacts', 'contactMap'],
    })
    this.receAddUserHandler = () => this.setData({ newFriendCount: wx.getStorageSync('newFriendCount-' + userStore.user.username) })
    chatSocket.addSuccessHandler(REC_ADD_USER, this.receAddUserHandler)
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
    this.receAddUserHandler()
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
    chatSocket.removeSuccessHandler(REC_ADD_USER, this.receAddUserHandler)
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
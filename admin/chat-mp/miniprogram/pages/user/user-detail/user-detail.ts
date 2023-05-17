import { createStoreBindings } from 'mobx-miniprogram-bindings'
import { BASE_URL } from '../../../consts/consts'
import { userStore } from '../../../store/user'
import { ChatDetailPath, FriendApplicationPath } from '../../../consts/routes'

// pages/user/user-detail/user-detail.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    STATIC_BASE_URL: BASE_URL,
    target: {} as Contact,
    isInContact: false
  },
  storeBindings: {} as StoreBindings,
  onLoad(query: { username: Users.Username; nickname: Users.Nickname; avatar: Users.Avatar }) {
    const { username, nickname, avatar } = query
    this.storeBindings = createStoreBindings(this, {
      store: userStore,
      fields: ['contacts', 'contactMap'],
    })
    this.setData({
      target: userStore.contactMap[username] || { username, nickname, avatar } as Contact, // 添加好友或查看好友
      isInContact: !!userStore.contactMap[username]
    })
  },
  // 添加到通讯录
  addContact() {
    const {username, nickname} = this.data.target
    wx.navigateTo({url: FriendApplicationPath + '?username=' + username + '&nickname=' + nickname})
  },
  // 发消息
  toChat() {
    wx.navigateTo({
      url: ChatDetailPath + '?username=' + this.data.target.username + '&type=1' // 单聊
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
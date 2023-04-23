import { UserDetailPath } from "../../consts/routes"
import { chatSocket } from "../../socket/socket"
import { SEARCH_USERS } from "../../socket/socket-actions"

// pages/addContact/addContact.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    username: '',
    noUser: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {

  },
  input() {},
  search() {
    chatSocket.send({ action: SEARCH_USERS, data: { username: this.data.username } })
    chatSocket.addSuccessHandler(SEARCH_USERS, (data: SocketResponse<Contact[]>) => {
      const contacts = data.data
      this.setData({ noUser: contacts.length === 0 })
      if (!this.data.noUser) {
        const { avatar, username, nickname, } = contacts[0]
        wx.navigateTo({
          url: UserDetailPath + '?avatar=' + avatar + '&username=' + username + '&nickname=' + nickname
        })
      }
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
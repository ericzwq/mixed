import { STATIC_BASE_URL } from '../../consts/consts'
import { chatSocket } from '../../socket/socket'
import { RECE_ADD_USER } from '../../socket/socket-actions'
import { userStore } from '../../store/user'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    STATIC_BASE_URL,
    friendApplications: [] as FriendApplication[]
  },

  receAddUserHandler: null as unknown as () => void,
  onLoad() {
    const { username } = userStore.user
    this.receAddUserHandler = () => {
      wx.removeStorageSync('newFriendCount-' + username)
      this.setData({ friendApplications: JSON.parse(wx.getStorageSync('friendApplications-' + username) || '[]') })
    }
    this.receAddUserHandler()
    chatSocket.addSuccessHandler(RECE_ADD_USER, this.receAddUserHandler)
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
    chatSocket.removeSuccessHandler(RECE_ADD_USER, this.receAddUserHandler)
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
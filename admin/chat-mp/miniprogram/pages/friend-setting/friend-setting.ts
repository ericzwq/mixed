import { chatSocket } from "../../socket/socket"
import { ADD_USER_RET } from "../../socket/socket-actions"

// pages/friend-setting/friend-setting.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    friendApl: {} as FriendApl,
    formData: {
      remark: ''
    },
    errors: {
      remark: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(query: { data: string }) {
    const friendApl: FriendApl = JSON.parse(decodeURIComponent(query.data))
    this.setData({ friendApl, 'formData.remark': friendApl.nickname })
  },
  addUserRet() {
    const friendApl = this.data.friendApl
    chatSocket.send({
      action: ADD_USER_RET, data: {
        friendAplId: friendApl.friendAplId,
        contactId: friendApl.contactId,
        to: friendApl.from,
        status: 1,
        remark: this.data.formData.remark
      }
    })
    chatSocket.addSuccessHandler(ADD_USER_RET, () => {

    })
  },
  remarkChange(e: WechatMiniprogram.CustomEvent) {
    this.setData({
      'formData.remark': e.detail,
      'errors.remark': e.detail ? '' : '请输入备注'
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
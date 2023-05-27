import {chatSocket} from "../../socket/socket"
import {ADD_USER, REC_ADD_USER} from "../../socket/socket-actions"
import {valueModel} from '../../common/utils'
import {userStore} from "../../store/user"

// pages/friend-application/friend-application.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    target: {} as Pick<Contact, 'username' | 'nickname'>,
    formData: {
      reason: '',
      remark: '',
    },
    errors: {
      reason: '',
      remark: ''
    },
    _validators: {
      reason(v: string) {
        this.setData({'errors.reason': v ? '' : '请输入申请原因'})
      },
      remark(v: string) {
        this.setData({'errors.remark': v ? '' : '请输入申请备注'})
      }
    }
  },
  valueModel,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(query: { username: Users.Username; nickname: Users.Nickname }) {
    let {username, nickname} = query
    nickname = decodeURIComponent(nickname)
    this.setData({target: {username, nickname}, formData: {reason: '你好，我是' + userStore.user.nickname, remark: nickname}})
  },
  reasonChange(e: VanInputEvent<string>) {
    this.setData({'formData.reason': e.detail})
    this.data._validators.reason.call(this, e.detail)
  },
  remarkChange(e: VanInputEvent<string>) {
    this.setData({'formData.remark': e.detail})
    this.data._validators.remark.call(this, e.detail)
  },
  addUser() {
    const {formData, target, _validators} = this.data
    if (Object.keys(formData).some(k => _validators[k as keyof typeof formData].call(this, formData[k as keyof typeof formData]))) return
    chatSocket.send({action: ADD_USER, data: {username: target.username, ...formData}})
    const {username} = userStore.user
    const saveFriendApls = (data: SocketResponse<FriendApl>) => {
      const friendApls: FriendApl[] = JSON.parse(wx.getStorageSync('friendApplications-' + username) || '[]')
      friendApls.unshift(data.data)
      wx.setStorageSync('friendApplications-' + username, JSON.stringify(friendApls))
    }
    chatSocket.addSuccessHandler<FriendApl>(ADD_USER, (data) => {
      saveFriendApls(data)
      wx.showToast({title: data.message})
      setTimeout(() => wx.navigateBack({delta: 1}), 1000);
    })
    chatSocket.addSuccessHandler<FriendApl>(REC_ADD_USER, saveFriendApls)
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
import { valueModel } from '../../../common/utils'
import http from '../../../http/http'
import { loginUrl } from '../../../http/urls'
import { userStore } from '../../../store/store'
import { chatSocket } from '../../../socket/socket'
import { ChatsPath } from '../../../consts/routes'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    rules: [{
      name: 'username',
      rules: [{ required: true, message: '用户名不能为空' }]
    }, {
      name: 'password',
      rules: [{ required: true, message: '密码不能为空' }]
    }],
    formData: {
      username: '',
      password: ''
    }
  },
  valueModel,
  login() {
    this.selectComponent('#form').validate((isValid: boolean, errors: any) => {
      if (errors) return wx.showToast({ title: errors[0].message, icon: 'error' })
      http.post<User>(loginUrl, this.data.formData).then(r => {
        const data = r.data
        userStore.setUser(data)
        wx.showToast({ title: '登录成功' })
        wx.switchTab({ url: ChatsPath })
        userStore.getContacts().then(() => chatSocket.connect())
        userStore.getChats()
      })
    })
  },
  storeBindings: {} as StoreBindings,
  onLoad() {
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
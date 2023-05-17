import { BASE_URL } from "../../consts/consts"
import { upAvatarUrl } from "../../http/urls"

// pages/create-group/create-group.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileList: [] as File[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options: PageOptions) {
    let data: Users.Username[]
    try {
      data = JSON.parse(decodeURIComponent(options.data!))
    } catch (e) {
      console.log(e)
      wx.showToast({ title: '页面参数错误', icon: 'error' })
      return
    }
    console.log(data)
  },
  afterRead(event: { detail: { file: File } }) {
    const { file } = event.detail;
    wx.uploadFile({
      url: BASE_URL + '/' + upAvatarUrl, // 仅为示例，非真实的接口地址
      filePath: file.url,
      name: 'file',
      header: { cookie: wx.getStorageSync('cookies') },
      success: (res) => {
        const { fileList } = this.data;
        fileList.push({ ...file, url: res.data });
        this.setData({ fileList });
      },
    });
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
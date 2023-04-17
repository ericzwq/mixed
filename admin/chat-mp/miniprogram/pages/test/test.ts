import { userStore } from "../../store/store"

// pages/test/test.ts
Page({

  /**
   * 页面的初始数据
   */
  change() {
    setTimeout(() => {
      userStore.setUser({ username: 'sdf' } as User)
    }, 1000);
  },
  data: {
    num: 6,
    ...userStore.data
  },
  getNum(v: number) {
    console.log(v + 10)
    return v + 10
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    console.log('test on load');
    
    userStore.bind(this)
    userStore.setUser({ username: 'zs' } as User)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    const query = wx.createSelectorQuery()
    query.select('#t').node(function (res) {
      console.log(res)
    })
    query.exec()
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
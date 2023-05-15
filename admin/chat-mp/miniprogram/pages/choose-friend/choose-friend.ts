import { createStoreBindings } from "mobx-miniprogram-bindings";
import { userStore } from "../../store/user";
import {STATIC_BASE_URL, primaryColor} from '../../consts/consts'

const selecteds = new Set<number>()
Page({
  data: {
    selectedMap: [] as boolean[],
    STATIC_BASE_URL,
    primaryColor
  },
  toggle(event: WechatMiniprogram.CustomEvent) {
    const { index } = event.currentTarget.dataset
    const selected = this.data.selectedMap[index]
    if (!selected && selecteds.size >= 10) {
      wx.showToast({ title: '最多选10个', icon: 'error' })
      return
    }
    this.data.selectedMap[index] = !selected
    selected ? selecteds.delete(index) : selecteds.add(index)
    this.setData({ selectedMap: [...this.data.selectedMap] })
  },
  storeBindings: {} as StoreBindings,
  onLoad() {
    this.storeBindings = createStoreBindings(this, {
      store: userStore,
      fields: ['contacts']
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
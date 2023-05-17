import { createStoreBindings } from "mobx-miniprogram-bindings";
import { userStore } from "../../store/user";
import { BASE_URL, primaryColor } from '../../consts/consts'
import { CreateGroupPath } from "../../consts/routes";

Page({
  data: {
    selecteds: [] as Contact[],
    STATIC_BASE_URL: BASE_URL,
    primaryColor,
    curContacts: [] as Contact[],
    keyword: ''
  },
  onLoad() {
    this.storeBindings = createStoreBindings(this, {
      store: userStore,
      fields: ['contacts']
    })
    this.setData({ curContacts: userStore.contacts })
  },
  toggle(event: WechatMiniprogram.CustomEvent) {
    const { index } = event.currentTarget.dataset
    const { selecteds } = this.data
    const contact = this.data.curContacts[index]
    const selected = selecteds.findIndex(c => c.username === contact.username) > -1
    if (!selected && selecteds.length >= 100) {
      wx.showToast({ title: '最多选100个', icon: 'error' })
      return
    }
    if (selected) {
      selecteds.splice(selecteds.findIndex(c => c.username === contact.username), 1)
    } else {
      selecteds.push(contact)
    }
    this.setData({ selecteds: [...selecteds] })
  },
  search(e: VanInputEvent<string>) {
    this.setData({ keyword: e.detail, curContacts: userStore.contacts.filter(c => c.nickname.includes(e.detail) || c.username.includes(e.detail)) })
  },
  unselect(e: WechatMiniprogram.CustomEvent) {
    const username: Users.Username = e.currentTarget.dataset.u
    const { selecteds } = this.data
    selecteds.splice(selecteds.findIndex(c => c.username === username), 1)
    this.setData({ selecteds: [...selecteds] })
  },
  storeBindings: {} as StoreBindings,
  toCreateGroup() {
    wx.navigateTo({ url: CreateGroupPath + '?data=' + JSON.stringify(this.data.selecteds.map(c => c.username)) })
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
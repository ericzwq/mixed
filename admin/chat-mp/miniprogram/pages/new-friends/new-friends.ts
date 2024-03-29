import {createStoreBindings} from 'mobx-miniprogram-bindings'
import {BASE_URL} from '../../consts/consts'
import {FriendSettingPath} from '../../consts/routes'
import {chatSocket} from '../../socket/socket'
import {ADD_USER_RET, REC_ADD_USER} from '../../socket/socket-actions'
import {userStore} from '../../store/user'
import storage from "../../common/storage";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    BASE_URL,
    friendApls: [] as FriendApl[]
  },

  receAddUserHandler: null as any,
  storeBindings: {} as StoreBindings,
  onLoad() {
    this.storeBindings = createStoreBindings(this, {
      store: userStore,
      fields: ['user']
    })
    this.receAddUserHandler = () => {
      userStore.setNewCatAplCount(0)
      this.setData({friendApls: storage.getFriendApls()})
    }
    this.receAddUserHandler()
    chatSocket.addSuccessHandler(REC_ADD_USER, this.receAddUserHandler)
    userStore.setNewCatAplCount(0)
  },
  accept(e: WechatMiniprogram.CustomEvent) {
    const friendApl = this.data.friendApls[e.currentTarget.dataset.i]
    wx.navigateTo({url: FriendSettingPath + '?data=' + encodeURIComponent(JSON.stringify(friendApl))})
  },
  reject(e: WechatMiniprogram.CustomEvent) {
    const friendApl = this.data.friendApls[e.currentTarget.dataset.i]
    const data = {
      id: friendApl.id,
      contactId: friendApl.contactId,
      to: friendApl.from,
      status: 2
    }
    chatSocket.send({action: ADD_USER_RET, data})
  },
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
    chatSocket.removeSuccessHandler(REC_ADD_USER, this.receAddUserHandler)
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
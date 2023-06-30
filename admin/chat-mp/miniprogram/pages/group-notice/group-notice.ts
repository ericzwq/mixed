import {createStoreBindings} from 'mobx-miniprogram-bindings'
import {BASE_URL} from '../../consts/consts'
import {chatSocket} from '../../socket/socket'
import {ADD_USER_RET, GROUP_INVITE_RET, REC_ADD_USER} from '../../socket/socket-actions'
import {userStore} from '../../store/user'
import storage from "../../common/storage";
import {GroupApls} from "../../socket/socket-types";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    BASE_URL,
    groupApls: [] as GroupApl[]
  },

  receAddUserHandler: null as any,
  storeBindings: {} as StoreBindings,
  onLoad() {
    this.storeBindings = createStoreBindings(this, {
      store: userStore,
      fields: ['user']
    })
    this.receAddUserHandler = () => {
      userStore.setNewGroupMsgCount(0)
      this.setData({groupApls: storage.getGroupApls()})
    }
    this.receAddUserHandler()
    chatSocket.addSuccessHandler(REC_ADD_USER, this.receAddUserHandler)
    userStore.setNewCatAplCount(0)
  },
  accept(e: WechatMiniprogram.CustomEvent) {
    const groupApl = this.data.groupApls[e.currentTarget.dataset.i]
    chatSocket.send({action: groupApl.type === GroupApls.Type.active ? ADD_USER_RET : GROUP_INVITE_RET, data: {id: groupApl.id, status: GroupApls.Status.accept}})
  },
  reject(e: WechatMiniprogram.CustomEvent) {
    const groupApl = this.data.groupApls[e.currentTarget.dataset.i]
    const data = {
      id: groupApl.id,
      status: GroupApls.Status.reject
    }
    chatSocket.send({action: groupApl.type === GroupApls.Type.active ? ADD_USER_RET : GROUP_INVITE_RET, data})
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
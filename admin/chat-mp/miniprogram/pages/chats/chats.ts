import {createStoreBindings} from 'mobx-miniprogram-bindings'
import {userStore} from "../../store/store"
import {BASE_URL} from '../../consts/consts'
import {ChatDetailPath} from '../../consts/routes'
// @ts-ignore
import Dialog from "@vant/weapp/dialog/dialog";

// const app = getApp()
Page({
  data: {
    activeIndex: -1,
    left: '',
    right: '',
    top: '',
    bottom: '',
    isActive: false,
    BASE_URL,
    floatMenu: {} as FloatMenu
  },
  onTouchStart(e: WechatMiniprogram.CustomEvent) {
    this.setData({activeIndex: +e.currentTarget.dataset.i})
  },
  onTouchCancel() {
    if (this.data.isActive) return
    this.setData({activeIndex: -1})
  },
  handleLongPress(e: LongPressEvent) {
    const {clientX, clientY} = e.touches[0]
    this.selectComponent('.float-menu').open(clientX, clientY)
    this.setData({isActive: true})
  },
  onClose() {
    this.setData({isActive: false, activeIndex: -1})
  },
  toDetail(e: WechatMiniprogram.CustomEvent) {
    const {to, chatType} = userStore.chats[e.currentTarget.dataset.i]
    wx.navigateTo({url: ChatDetailPath + '?to=' + to + '&type=' + chatType})
  },
  setRead() {
    const {chats, user: {username}} = userStore
    chats[this.data.activeIndex].newCount = 0
    userStore.setChats([...chats])
    wx.setStorageSync('chats-' + username, JSON.stringify(chats))
    this.data.floatMenu.close()
    this.onClose()
  },
  cancelRead() {
    const {chats, user: {username}} = userStore
    chats[this.data.activeIndex].newCount = 1
    userStore.setChats([...chats])
    wx.setStorageSync('chats-' + username, JSON.stringify(chats))
    this.data.floatMenu.close()
    this.onClose()
  },
  setTop() {
    const {chats, user: {username}} = userStore
    const chat = chats.splice(this.data.activeIndex, 1)[0]
    let index = 0
    for (let i = 0; i < chats.length; i++) {
      index = i
      if (!chats[i].isTop || new Date(chats[i].createdAt).getTime() < new Date(chat.createdAt).getTime()) break
    }
    chat.isTop = true
    chats.splice(index, 0, chat)
    userStore.setChats([...chats], false)
    wx.setStorageSync('chats-' + username, JSON.stringify(chats))
    this.data.floatMenu.close()
    this.onClose()
  },
  cancelTop() {
    const {chats, user: {username}} = userStore
    const chat = chats.splice(this.data.activeIndex, 1)[0]
    let index = 0
    for (let i = chats.length - 1; i > -1; i--) {
      index = i
      if (chats[i].isTop) break
      if (new Date(chats[i].createdAt).getTime() > new Date(chat.createdAt).getTime()) {
        index = i + 1
        break
      }
    }
    chat.isTop = false
    chats.splice(index, 0, chat)
    userStore.setChats([...chats], false)
    wx.setStorageSync('chats-' + username, JSON.stringify(chats))
    this.data.floatMenu.close()
    this.onClose()
  },
  hiddenChat() {
    const {chats, user: {username}} = userStore
    chats.splice(this.data.activeIndex, 1)
    userStore.setChats([...chats])
    wx.setStorageSync('chats-' + username, JSON.stringify(chats))
    this.data.floatMenu.close()
    this.onClose()
  },
  deleteChat() {
    this.data.floatMenu.close()
    this.onClose()
    Dialog.confirm({message: '删除后聊天记录将会清空，是否继续？'}).then(() => {
      const {chats, user: {username}} = userStore
      const chat = chats.splice(this.data.activeIndex, 1)[0]
      userStore.setChats([...chats])
      wx.setStorageSync('chats-' + username, JSON.stringify(chats))
      const prefixKey = username + '-' + chat.chatType + '-' + chat.to + '-'
      const index = wx.getStorageSync(prefixKey + 'i')
      if (index) {
        for (let i = 0, l = +index; i <= l; i++) wx.removeStorageSync(prefixKey + i)
        wx.removeStorageSync(prefixKey + 'i')
      }
    }).catch(() => 0)
  },
  storeBindings: {} as StoreBindings,
  onLoad() {
    this.storeBindings = createStoreBindings(this, {
      store: userStore,
      fields: ['chats', 'unameUserMap', 'user']
    })
    this.data.floatMenu = this.selectComponent('.float-menu') as FloatMenu
    // const messageInfo = app.getMessageInfo('eric', '1')
    // console.log(messageInfo)
    // todo test
    /*let a = [
      {
        "nickname": "ff",
        "avatar": "/uploads/upload_5e1789b5c1a7fa55ca5d7c78030f8075.jpg",
        "content": [{type: 2, value: 'eric'}, {type: 1, value: '创建了群聊'}],
        "createdAt": "2023-05-25 10:55:40",
        "newCount": 0,
        "type": 6,
        "from": "eric",
        "to": 28,
        "chatType": "2",
        "isTop": false
      }, {
        "nickname": "外卖群",
        "avatar": "/uploads/upload_98b3c7a42a81f9fa3d9cf33ecf83c129.jpg",
        "content": [{type: 2, value: 'eric'}, {type: 1, value: '创建了群聊'}],
        "createdAt": "2023-05-25 10:16:20",
        "newCount": 0,
        "type": 6,
        "from": "eric",
        "to": 26,
        "chatType": "2",
        "isTop": false
      }, {
        "nickname": "undefined",
        "content": "f",
        "createdAt": "2023-05-26 17:53:09",
        "newCount": 0,
        "type": 4,
        "from": "eric",
        "chatType": "1",
        "isTop": false
      }, {
        "nickname": "淡定",
        "avatar": "/avatar/th(1).jpg",
        "createdAt": "2023-05-26 17:56:12",
        "newCount": 0,
        "type": 2,
        "from": "eric",
        "to": "eric",
        "chatType": "1",
        "isTop": false
      }, {
        "nickname": "f",
        "avatar": "/uploads/upload_5d2888d5448e8d3468b5e85301fc22aa.jpg",
        "content": [{"type": 2, "value": "eric"}, {"type": 1, "value": "创建了群聊"}],
        "createdAt": "2023-05-25 10:44:55",
        "newCount": 0,
        "type": 6,
        "from": "eric",
        "to": 27,
        "chatType": "2",
        "isTop": false
      }, {
        "nickname": "等等",
        "avatar": "/avatar/th(2).jpg",
        "content": "sfd",
        "createdAt": "2023-05-26 16:02:58",
        "newCount": 0,
        "type": 1,
        "from": "eric",
        "to": "eric2",
        "chatType": "1",
        "isTop": false,
        "state": "loading"
      }, {
        "nickname": "布露妮娅",
        "avatar": "/avatar/th.jpg",
        "createdAt": "2023-05-26 17:42:52",
        "newCount": 0,
        "type": 3,
        "from": "eric",
        "to": "eric3",
        "chatType": "1",
        "isTop": false,
        "state": "error"
      }, {"content": "2", "createdAt": "2023-05-26 15:15:57", "newCount": 0, "type": 1, "from": "eric", "chatType": "1", "isTop": false}]

    a.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    userStore.setChats(a as any)
    wx.setStorageSync('chats-' + userStore.user.username, JSON.stringify(a))*/
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
    this.getTabBar().init()
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
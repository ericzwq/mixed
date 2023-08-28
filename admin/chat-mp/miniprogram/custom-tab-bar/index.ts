import { ChatsPath, ContactPath, FoundPath, GroupNoticePath, NewFriendsPath, PersonalPath } from "../consts/routes";
import { chatSocket } from "../socket/socket";
import { REC_ADD_GROUP, REC_ADD_USER, REC_GROUP_INVITE } from "../socket/socket-actions";
import { userStore } from "../store/user";
import { createStoreBindings } from "mobx-miniprogram-bindings";
import storage from "../common/storage";

Component({
  options: {
    styleIsolation: 'shared'
  },
  properties: {},
  lifetimes: {
    attached() {
      this.data.storeBindings = createStoreBindings(this, {
        store: userStore,
        fields: ['newMsgCount', 'newCatAplCount', 'newGroupAplCount']
      })
      chatSocket.addSuccessHandler<FriendApl>(REC_ADD_USER, (data) => {
        const pages = getCurrentPages()
        if (!pages[pages.length - 1].url.includes(NewFriendsPath)) {
          userStore.setNewCatAplCount(userStore.newCatAplCount + 1)
          const count = userStore.newCatAplCount + userStore.newGroupAplCount
          this.data.list[0].info = count ? count + '' : ''
          this.setData({ list: [...this.data.list] })
        }
        const friendApls: FriendApl[] = storage.getFriendApls()
        friendApls.unshift(data.data)
        storage.setFriendApls(friendApls)
      }, 0)
      const recGroupNoticeHandler = (data: SocketResponse<GroupApl>) => {
        const pages = getCurrentPages()
        if (!pages[pages.length - 1].url.includes(GroupNoticePath)) {
          userStore.setNewGroupMsgCount(userStore.newGroupAplCount + 1)
          const count = userStore.newCatAplCount + userStore.newGroupAplCount
          this.data.list[0].info = count ? count + '' : ''
          this.setData({ list: [...this.data.list] })
        }
        const groupApls: GroupApl[] = storage.getGroupApls()
        groupApls.unshift(data.data)
        storage.setGroupApls(groupApls)
      }
      chatSocket.addSuccessHandler<GroupApl>(REC_GROUP_INVITE, recGroupNoticeHandler) // 群邀请
      chatSocket.addSuccessHandler<GroupApl>(REC_ADD_GROUP, recGroupNoticeHandler) // 申请入群
    },
    detached() {
      this.data.storeBindings.destroyStoreBindings()
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    active: 0,
    chats: {
      icon: '../static/image/message.svg',
      activeIcon: '../static/image/message-active.svg',
      text: '消息',
      url: ChatsPath,
    },
    list: [
      {
        icon: '../static/image/contact.svg',
        activeIcon: '../static/image/contact-active.svg',
        text: '联系人',
        url: ContactPath,
        info: ''
      },
      {
        icon: '../static/image/found.svg',
        activeIcon: '../static/image/found-active.svg',
        text: '发现',
        url: FoundPath,
        info: ''
      },
      {
        icon: '../static/image/personal.svg',
        activeIcon: '../static/image/personal-active.svg',
        text: '我的',
        url: PersonalPath,
        info: ''
      }],
    storeBindings: {} as StoreBindings,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onChange(event: { detail: number }) {
      const routeMap = {
        0: ChatsPath,
        1: ContactPath,
        2: FoundPath,
        3: PersonalPath
      } as { [key in string]: string }
      this.setData({ active: event.detail })
      wx.switchTab({ url: routeMap[event.detail] })
    },
    init() {
      const page = getCurrentPages().pop()
      if (!userStore.user.username) return
      userStore.setNewCatAplCount(storage.getNewCatAplCount())
      userStore.setNewGroupMsgCount(storage.getNewGroupAplCount())
      const count = userStore.newCatAplCount + userStore.newGroupAplCount
      this.data.list[0].info = count ? count + '' : ''
      this.setData({ active: this.data.list.findIndex(v => v.url === '/' + page!.route) + 1, list: [...this.data.list] })
    }
  }
})

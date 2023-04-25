import { ChatsPath, ContactPath, FoundPath, PersonalPath } from "../consts/routes";
import { chatSocket } from "../socket/socket";
import { RECE_ADD_USER } from "../socket/socket-actions";
import { userStore } from "../store/user";

Component({
  options: {
    styleIsolation: 'shared'
  },
  properties: {

  },
  lifetimes: {
    attached() {
      chatSocket.addSuccessHandler<FriendApplication>(RECE_ADD_USER, (data) => {
        this.data.list[1].info = (+this.data.list[1].info + 1) + ''
        this.setData({ list: [...this.data.list] })
        const { username } = userStore.user
        wx.setStorageSync('newFriendCount-' + username, this.data.list[1].info)
        const friendApls: FriendApplication[] = JSON.parse(wx.getStorageSync('friendApplications-' + username) || '[]')
        friendApls.unshift(data.data)
        wx.setStorageSync('friendApplications-' + username, JSON.stringify(friendApls))
      }, 0)
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    active: 0,
    list: [{
      icon: '../static/image/message.svg',
      activeIcon: '../static/image/message-active.svg',
      text: '消息',
      url: ChatsPath,
      info: ''
    },
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
    }]
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
      this.data.list[1].info = wx.getStorageSync('newFriendCount-' + userStore.user.username)
      this.setData({ active: this.data.list.findIndex(v => v.url === '/' + page?.route), list: [...this.data.list] })
    }
  }
})

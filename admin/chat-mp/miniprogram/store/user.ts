import { observable, action } from 'mobx-miniprogram'
import { chatSocket } from '../socket/socket'
import { GET_CONTACTS } from '../socket/socket-actions'

const store = observable({
  contacts: [] as Contact[],
  contactMap: {} as ContactMap,
  user: {} as User,
  chats: [] as ChatItem[],
  unameMessageInfoMap: {} as UnameMessageInfoMap,
  setUnameMessageInfoMap: action(function (value: UnameMessageInfoMap) {
    store.unameMessageInfoMap = value
  }),
  getChats() {
    this.setChats(JSON.parse(wx.getStorageSync('chats-' + this.user.username) || '[]'))
  },
  setChats: action(function (value: ChatItem[]) {
    store.chats = value
  }),
  setContacts: action(function (value: Contact[]) {
    store.contacts = value
    const contactMap = {} as ContactMap
    value.forEach(v => contactMap[v.username] = v)
    store.contactMap = contactMap
  }),
  // 获取通讯录
  getContacts() {
    return new Promise<void>(resolve => {
      let contacts = wx.getStorageSync('contacts-' + this.user.username)
      if (!contacts) {
        chatSocket.addSuccessHandler<Contact[]>(GET_CONTACTS, (r) => {
          const data = store.user
          if (data.username) r.data.push({ avatar: data.avatar, username: data.username, nickname: data.nickname, status: '00' }) // 已获取用户信息
          wx.setStorageSync('contacts-' + this.user.username, JSON.stringify(r.data))
          this.setContacts(r.data)
          resolve()
        }, 0)
        chatSocket.send({ action: GET_CONTACTS })
      } else {
        this.setContacts(JSON.parse(contacts))
        resolve()
      }
    })
  },
  setUser: action(function (value: User) {
    store.user = value
    if (store.contacts.length) { // 已获取通讯录
      store.setContacts([...store.contacts, { avatar: value.avatar, username: value.username, nickname: value.nickname, status: '00' }])
      wx.setStorageSync('contacts-' + userStore.user.username, JSON.stringify(store.contacts))
    }
    wx.setStorageSync('user', JSON.stringify(value))
  })
})

export const userStore = store
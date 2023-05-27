import {observable, action} from 'mobx-miniprogram'
import {chatSocket} from '../socket/socket'
import {GET_CONTACTS, GET_FRIEND_APLS, GET_GROUP_INFO} from '../socket/socket-actions'

const store = observable({
  contacts: [] as Contact[],
  contactMap: {} as ContactMap,
  user: {} as User,
  chats: [] as ChatItem[],
  unameMessageInfoMap: {} as UnameMessageInfoMap, // 单聊用户对应的数据
  groupIdMessageInfoMap: {} as GroupIdMessageInfoMap, // 群聊用户对应的数据
  groupIdGroupInfoMap: {} as GroupIdGroupInfoMap, // 群id对应的群信息
  unameUserMap: {} as UnameUserMap, // 群成员对应的用户信息
  newMsgCount: '',
  setNewMsgCount: action(function (value: number) {
    store.newMsgCount = value === 0 ? '' : value + ''
  }),
  setUnameMessageInfoMap: action(function (value: UnameMessageInfoMap) {
    store.unameMessageInfoMap = value
  }),
  setGroupIdMessageInfoMap: action(function (value: GroupIdMessageInfoMap) {
    store.groupIdMessageInfoMap = value
  }),
  getGroupIdGroupInfoMap() {
    this.setGroupIdGroupInfoMap(JSON.parse(wx.getStorageSync('groupIdGroupInfoMap-' + this.user.username) || '{}'))
  },
  getGroupIdGroupInfo(id: Groups.Id): Promise<GroupInfo> {
    return new Promise(resolve => {
      let groupInfo = store.groupIdGroupInfoMap[id]
      if (!groupInfo) {
        chatSocket.send({action: GET_GROUP_INFO, data: {id}}).then(() => {
          const handler = (data: SocketResponse<GroupInfo>) => {
            chatSocket.removeSuccessHandler(GET_GROUP_INFO, handler)
            store.groupIdGroupInfoMap[id] = data.data
            store.setGroupIdGroupInfoMap(store.groupIdGroupInfoMap)
            wx.setStorageSync('groupIdGroupInfoMap-' + this.user.username, JSON.stringify(store.groupIdGroupInfoMap))
            resolve(data.data)
          }
          chatSocket.addSuccessHandler(GET_GROUP_INFO, handler)
        })
      } else {
        resolve(groupInfo)
      }
    })
  },
  setGroupIdGroupInfoMap: action(function (value: GroupIdGroupInfoMap) {
    store.groupIdGroupInfoMap = value
  }),
  getUnameUserMap() {
    this.setUnameUserMap(JSON.parse(wx.getStorageSync('unameUserMap-' + this.user.username) || '{}'))
  },
  setUnameUserMap: action(function (value: UnameUserMap) {
    store.unameUserMap = value
  }),
  getChats() {
    const chats: ChatItem[] = JSON.parse(wx.getStorageSync('chats-' + this.user.username) || '[]')
    this.setChats(chats)
    this.setNewMsgCount(chats.reduce((pre, cur) => pre + cur.newCount, 0))
  },
  setChats: action(function (value: ChatItem[]) {
    store.chats = value
    store.setNewMsgCount(value.reduce((pre, cur) => pre + cur.newCount, 0))
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
      const {username, nickname, avatar, email} = this.user
      let contacts = wx.getStorageSync('contacts-' + username)
      if (!contacts) {
        chatSocket.addSuccessHandler<Required<Contact>[]>(GET_CONTACTS, (r) => {
          const contacts: Contact[] = []
          const unameUserMap = this.unameUserMap
          r.data.forEach(({username, remark, status, avatar, nickname, email}) => {
            contacts.push({username, remark, status})
            unameUserMap[username] = {avatar, nickname, email}
          })
          if (username && !contacts.find(c => c.username === username)) { // 已获取用户信息
            contacts.push({username, remark: nickname, status: 0})
            unameUserMap[username] = {avatar, nickname, email}
          }
          wx.setStorageSync('unameUserMap-' + username, JSON.stringify(unameUserMap))
          wx.setStorageSync('contacts-' + username, JSON.stringify(contacts))
          this.setUnameUserMap(unameUserMap)
          this.setContacts(contacts)
          resolve()
        }, 0)
        chatSocket.send({action: GET_CONTACTS})
      } else {
        this.setContacts(JSON.parse(contacts))
        resolve()
      }
    })
  },
  setUser: action(function (value: User) {
    store.user = value
    if (store.contacts.length) { // 已获取通讯录
      store.setContacts([...store.contacts, {avatar: value.avatar, username: value.username, nickname: value.nickname, status: 0, remark: value.nickname}])
      wx.setStorageSync('contacts-' + userStore.user.username, JSON.stringify(store.contacts))
    }
    wx.setStorageSync('user', JSON.stringify(value))
  }),
  getFriendApls() {
    const friendApls: FriendApl[] = JSON.parse(wx.getStorageSync('friendApplications-' + this.user.username) || '[]')
    chatSocket.send({action: GET_FRIEND_APLS, data: {lastFriendAplId: friendApls.length ? friendApls[0].friendAplId : null}})
    chatSocket.addSuccessHandler<FriendApl[]>(GET_FRIEND_APLS, data => {
      data.data.forEach(friendApl => {
        const id = friendApl.friendAplId
        console.log(id) // todo
      })
    })
  },
  async init() {
    this.getUnameUserMap()
    await this.getContacts()
    await this.getChats()
    await this.getGroupIdGroupInfoMap()
    await this.getFriendApls()
  },
})

export const userStore = store
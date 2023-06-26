import {observable, action} from 'mobx-miniprogram'
import {chatSocket} from '../socket/socket'
import {GET_CONTACTS, GET_FRIEND_APLS, GET_GROUP_INFO, GET_GROUPS, SEARCH_USERS} from '../socket/socket-actions'

const store = observable({
  contacts: [] as Contact[],
  contactMap: {} as ContactMap,
  user: {} as User,
  chats: [] as ChatItem[],
  groups: null as GetGroupsRes[] | null,
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
  setChats: action(function (value: ChatItem[], setNewMsgCount = true) {
    store.chats = value
    setNewMsgCount && store.setNewMsgCount(value.reduce((pre, cur) => pre + cur.newCount, 0))
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
          this.setUnameUserMap({...unameUserMap})
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
    const handler = (data: SocketResponse<FriendApl[]>) => {
      data.data.forEach(friendApl => {
        const id = friendApl.friendAplId
        console.log(id) // todo
      })
    }
    chatSocket.addSuccessHandler<FriendApl[]>(GET_FRIEND_APLS, handler)
  },
  setGroups: action(function (value: GetGroupsRes[]) {
    store.groups = value
  }),
  async getGroups() {
    const {username} = this.user
    return new Promise(resolve => {
      if (store.groups) return resolve(store.groups)
      const storage = wx.getStorageSync('groups-' + username)
      if (storage) {
        const data = JSON.parse(storage)
        store.setGroups(data)
        return resolve(data)
      }
      chatSocket.send({action: GET_GROUPS})
      const handler = (data: SocketResponse<GetGroupsRes[]>) => {
        chatSocket.removeSuccessHandler(GET_GROUPS, handler)
        wx.setStorageSync('groups-' + username, JSON.stringify(data.data))
        store.setGroups(data.data)
        resolve(data.data)
      }
      chatSocket.addSuccessHandler(GET_GROUPS, handler)
    })
  },
  getUsers(usernames: Users.Username[]): Promise<Omit<User, 'username'>[]> {
    const {unameUserMap, user: {username: _username}} = this
    return new Promise(async (resolve, reject) => {
      const res: Omit<User, 'username'>[] = []
      const usernameIndexMap = {} as { [k in string]: number }
      const fetchUsers = []
      for (let i = 0; i < usernames.length; i++) {
        const username = usernames[i]
        usernameIndexMap[username] = i
        if (unameUserMap[username]) res[i] = unameUserMap[username]
        else fetchUsers.push(username)
      }
      chatSocket.send({action: SEARCH_USERS, data: {usernames: fetchUsers}})
      const handler = (data: SocketResponse<User[]>) => {
        chatSocket.removeSuccessHandler(SEARCH_USERS, handler)
        if (!data.data.length) {
          reject('无该用户信息')
          return console.error('无该用户信息', usernames, data)
        }
        data.data.forEach(user => {
          const {username, nickname, avatar, email} = user
          unameUserMap[username] = {nickname, avatar, email}
          res[usernameIndexMap[username]] = unameUserMap[username]
        })
        this.setUnameUserMap(unameUserMap)
        wx.setStorageSync('unameUserMap-' + _username, JSON.stringify(unameUserMap))
        resolve(res)
      }
      chatSocket.addSuccessHandler(SEARCH_USERS, handler)
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
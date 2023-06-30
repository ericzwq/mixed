import {observable, action} from 'mobx-miniprogram'
import {chatSocket} from '../socket/socket'
import {GET_CONTACTS, GET_FRIEND_APLS, GET_GROUP_APLS, GET_GROUP_INFO, GET_GROUPS, SEARCH_USERS} from '../socket/socket-actions'
import storage from "../common/storage";

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
  newCatAplCount: 0,
  newGroupAplCount: 0,
  newMsgCount: '',
  setNewCatAplCount: action(function (value: number) {
    store.newCatAplCount = value
    storage.setNewCatAplCount(value)
  }),
  setNewGroupMsgCount: action(function (value: number) {
    store.newGroupAplCount = value
    storage.setNewGroupAplCount(value)
  }),
  setNewMsgCount: action(function (value: number) {
    store.newMsgCount = value === 0 ? '' : value + ''
  }),
  setUnameMessageInfoMap: action(function (value: UnameMessageInfoMap) {
    store.unameMessageInfoMap = value
  }),
  setGroupIdMessageInfoMap: action(function (value: GroupIdMessageInfoMap) {
    store.groupIdMessageInfoMap = value
  }),
  initGroupIdGroupInfoMap() {
    this.setGroupIdGroupInfoMap(storage.getGroupIdGroupInfoMap())
  },
  getGroupIdGroupInfo(id: Groups.Id): Promise<GroupInfo> {
    return new Promise(resolve => {
      let groupInfo = this.groupIdGroupInfoMap[id]
      if (!groupInfo) {
        chatSocket.send({action: GET_GROUP_INFO, data: {id}}).then(() => {
          const handler = (data: SocketResponse<GroupInfo>) => {
            chatSocket.removeSuccessHandler(GET_GROUP_INFO, handler)
            this.groupIdGroupInfoMap[id] = data.data
            this.setGroupIdGroupInfoMap(this.groupIdGroupInfoMap)
            storage.setGroupIdGroupInfoMap(this.groupIdGroupInfoMap)
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
  initUnameUserMap() {
    this.setUnameUserMap(storage.getUnameUserMap())
  },
  setUnameUserMap: action(function (value: UnameUserMap) {
    store.unameUserMap = value
  }),
  initChats() {
    const chats: ChatItem[] = storage.getChats()
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
  initContacts() {
    return new Promise<void>(resolve => {
      const {username, nickname, avatar, email} = this.user
      let contacts = storage.getContacts()
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
          storage.setUnameUserMap(unameUserMap)
          storage.setContacts(contacts)
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
      storage.setContacts(store.contacts)
    }
    storage.setUsername(value.username)
    storage.setUser(value)
  }),
  // 获取好友申请
  requestFriendApls() {
    const friendApls = storage.getFriendApls()
    chatSocket.send({action: GET_FRIEND_APLS, data: {index: 1, size: 10} as PageQuery})
    let count = this.newCatAplCount
    const handler = (data: SocketResponse<FriendApl[]>) => {
      const idUpdatedMap = {} as { [k in string]: FriendApls.UpdatedAt }
      friendApls.forEach(fa => idUpdatedMap[fa.id] = fa.updatedAt)
      data.data.forEach(friendApl => {
        if (idUpdatedMap[friendApl.id] !== friendApl.updatedAt) ++count && friendApls.push(friendApl)
      })
      storage.setFriendApls(friendApls)
      this.setNewCatAplCount(count)
    }
    chatSocket.addSuccessHandler<FriendApl[]>(GET_FRIEND_APLS, handler)
  },
  setGroups: action(function (value: GetGroupsRes[]) {
    store.groups = value
  }),
  // 获取群列表
  async getGroups() {
    return new Promise(resolve => {
      if (store.groups) return resolve(store.groups)
      const groups = storage.getGroups()
      if (groups) {
        const data = JSON.parse(groups)
        store.setGroups(data)
        return resolve(data)
      }
      chatSocket.send({action: GET_GROUPS})
      const handler = (data: SocketResponse<GetGroupsRes[]>) => {
        chatSocket.removeSuccessHandler(GET_GROUPS, handler)
        store.setGroups(data.data)
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
      if (!fetchUsers.length) {
        resolve(res)
        return
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
        store.setUnameUserMap(unameUserMap)
        resolve(res)
      }
      chatSocket.addSuccessHandler(SEARCH_USERS, handler)
    })
  },
  // 获取群申请
  async requestGroupApls() {
    const groupApls: GroupApl[] = storage.getGroupApls()
    chatSocket.send({action: GET_GROUP_APLS, data: {index: 1, size: 10} as PageQuery})
    let count = +this.newGroupAplCount
    const handler = (data: SocketResponse<GroupApl[]>) => {
      const idUpdatedMap = {} as { [k in string]: GroupApls.UpdatedAt }
      groupApls.forEach(ga => idUpdatedMap[ga.id] = ga.updatedAt)
      data.data.forEach(groupApl => {
        if (idUpdatedMap[groupApl.id] !== groupApl.updatedAt) ++count && groupApls.push(groupApl)
      })
      storage.setGroupApls(groupApls)
      this.setNewGroupMsgCount(count)
    }
    chatSocket.addSuccessHandler<GroupApl[]>(GET_FRIEND_APLS, handler)
  },
  async init() {
    this.initUnameUserMap()
    await this.initContacts()
    await this.initChats()
    await this.initGroupIdGroupInfoMap()
    await this.requestFriendApls()
    await this.requestGroupApls()
  },
})

export const userStore = store
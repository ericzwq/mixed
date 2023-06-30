export default {
  username: '',
  setUser(data: User) {
    wx.setStorageSync('user', JSON.stringify(data))
  },
  setUsername(data: Users.Username) {
    this.username = data
  },
  // 保存未处理的被撤回的消息信息
  setUntreatedRetractMsgInfos(data: UntreatedRetractMsgInfo[]) {
    wx.setStorageSync('untreatedRetractMsgInfos-' + this.username, JSON.stringify(data))
  },
  // 获取需要处理的被撤回的消息信息
  getUntreatedRetractMsgInfos() {
    return JSON.parse(wx.getStorageSync('untreatedRetractMsgInfos-' + this.username) || '[]') as UntreatedRetractMsgInfo[]
  },
  getUntreatedRetractMsgInfoSet() {
    const retractMsgInfos = this.getUntreatedRetractMsgInfos()
    const set = new Set<string>()
    retractMsgInfos.forEach(({id, chatType}) => set.add(id + '-' + chatType))
    return set
  },
  setUntreatedRetractMsgInfoSet(set: Set<string>) {
    const data: UntreatedRetractMsgInfo[] = []
    for (const item of set) {
      const [id, chatType] = item.split('-')
      data.push({id: +id, chatType: chatType as ChatType})
    }
    this.setUntreatedRetractMsgInfos(data)
  },
  getFriendApls() {
    return JSON.parse(wx.getStorageSync('friendApplications-' + this.username) || '[]') as FriendApl[]
  },
  setFriendApls(data: FriendApl[]) {
    wx.setStorageSync('friendApplications-' + this.username, JSON.stringify(data))
  },
  getGroups() {
    return wx.getStorageSync('groups-' + this.username)
  },
  setGroups(data: GroupInfo[]) {
    wx.setStorageSync('groups-' + this.username, JSON.stringify(data))
  },
  getUnameUserMap() {
    return JSON.parse(wx.getStorageSync('unameUserMap-' + this.username) || '{}')
  },
  setUnameUserMap(data: UnameUserMap) {
    return wx.setStorageSync('unameUserMap-' + this.username, JSON.stringify(data))
  },
  getChats() {
    return JSON.parse(wx.getStorageSync('chats-' + this.username) || '[]')
  },
  setChats(data: ChatItem[]) {
    wx.setStorageSync('chats-' + this.username, JSON.stringify(data))
  },
  getContacts() {
    return wx.getStorageSync('contacts-' + this.username)
  },
  setContacts(data: Contact[]) {
    wx.setStorageSync('contacts-' + this.username, JSON.stringify(data))
  },
  getGroupApls() {
    return JSON.parse(wx.getStorageSync('groupApplications-' + this.username) || '[]')
  },
  setGroupApls(data: GroupApl[]) {
    wx.setStorageSync('groupApplications-' + this.username, JSON.stringify(data))
  },
  getGroupIdGroupInfoMap() {
    return JSON.parse(wx.getStorageSync('groupIdGroupInfoMap-' + this.username) || '{}')
  },
  setGroupIdGroupInfoMap(data: GroupIdGroupInfoMap) {
    wx.setStorageSync('groupIdGroupInfoMap-' + this.username, JSON.stringify(data))
  },
  getNewCatAplCount() {
    return +(wx.getStorageSync('newCatAplCount-' + this.username) || 0)
  },
  setNewCatAplCount(data: number) {
    wx.setStorageSync('newCatAplCount-' + this.username, data)
  },
  getNewGroupAplCount() {
    return +(wx.getStorageSync('newGroupAplCount-' + this.username) || 0)
  },
  setNewGroupAplCount(data: number) {
    wx.setStorageSync('newGroupAplCount-' + this.username, data)
  },
  // 获取未处理已读的消息信息
  getUntreatedReadMsgInfos() {
    return JSON.parse(wx.getStorageSync('untreatedReadMsgInfos-' + this.username) || '[]') as UntreatedReadMsgInfo[]
  },
  setUntreatedReadMsgInfos(data: UntreatedReadMsgInfo[]) {
    wx.setStorageSync('untreatedReadMsgInfos-' + this.username, JSON.stringify(data))
  },
  getUntreatedReadMsgInfoSet() {
    const retractMsgInfos = this.getUntreatedReadMsgInfos()
    const set = new Set<string>()
    retractMsgInfos.forEach(({id, chatType}) => set.add(id + '-' + chatType))
    return set
  },
  setUntreatedReadMsgInfoSet(set: Set<string>) {
    const data: UntreatedReadMsgInfo[] = []
    for (const item of set) {
      const [id, chatType] = item.split('-')
      data.push({id: +id, chatType: chatType as ChatType})
    }
    this.setUntreatedReadMsgInfos(data)
  },
}
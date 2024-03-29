import { createStoreBindings } from 'mobx-miniprogram-bindings'
import { ChatDetailPath, LoginPath } from './consts/routes'
import { chatSocket } from "./socket/socket"
import { READ_GP_MSGS, READ_SG_MSGS, REC_GP_MSGS, REC_SG_MSGS } from './socket/socket-actions'
import { userStore } from "./store/user"
import { ChatType, MsgState, MsgType, MsgRead, MsgStatus } from './socket/socket-types'
import { SAVE_MESSAGE_LENGTH } from "./consts/consts";
import storage from "./common/storage";

// todo 回复回显 文本超长
App<IAppOption>({
  globalData: {
    toSaveUnameFakeIdsMap: {} as { [k in string]: Set<SgMsgs.FakeId> },
    toSaveGroupIdFakeIdsMap: {} as { [k in string]: Set<SgMsgs.FakeId> },
    saveStatus: '',
    visible: true
  },
  onShow() {
    this.globalData.visible = true
  },
  onHide() {
    this.globalData.visible = false
  },
  onLaunch() {
    createStoreBindings({ setData: () => 0 }, {
      store: userStore,
      actions: ['setUser']
    })
    this.addRecSgMsgsListener()
    this.addRecGpMsgsListener()
    this.addReadMsgsListener()
    if (!this.getUser()) return
    wx.showLoading({ title: '加载中...', mask: true })
    chatSocket.connect()
      .then(() => userStore.init())
      .then(() => wx.hideLoading())
      .catch(e => {
        wx.hideLoading()
        wx.showToast({ title: '初始化异常', icon: 'error' })
        console.log('初始化异常', e)
      })
  },
  // 获取用户信息
  getUser() {
    const user = wx.getStorageSync('user')
    if (!user) {
      chatSocket.close('无用户信息')
      wx.navigateTo({ url: LoginPath })
    } else {
      userStore.setUser(JSON.parse(user))
    }
    return !!user
  },
  getMessageInfo(to: Users.Username | Groups.Id, chatType: ChatType) {
    const { unameMessageInfoMap, groupIdMessageInfoMap, user: { username } } = userStore
    const isSingle = chatType === ChatType.single
    let messageInfo = isSingle ? unameMessageInfoMap[to] : groupIdMessageInfoMap[to]
    if (!messageInfo) {
      const prefixKey = username + '-' + (isSingle ? ChatType.single : ChatType.group) + '-' + to + '-'
      const index = wx.getStorageSync(prefixKey + 'i')
      messageInfo = {
        fakeIdIndexMap: {},
        messages: [],
        maxMsgsIndex: 0,
        loadedMsgsMinIndex: 0,
        showedMsgsMinIndex: 0
      }
      if (index) {
        messageInfo.messages = JSON.parse(wx.getStorageSync(prefixKey + index))
        messageInfo.messages.forEach((v: SgMsg | GpMsg, i: number) => messageInfo.fakeIdIndexMap[v.fakeId!] = i)
        messageInfo.maxMsgsIndex = +(index || 0)
        messageInfo.loadedMsgsMinIndex = messageInfo.maxMsgsIndex
        messageInfo.showedMsgsMinIndex = messageInfo.messages.length
      }
      if (isSingle) unameMessageInfoMap[to] = messageInfo as MessageInfo<SgMsg>
      else groupIdMessageInfoMap[to] = messageInfo as MessageInfo<GpMsg>
    }
    return messageInfo
  },
  async recMsgSuccessHandler<T extends SgMsgRes | GpMsgRes>(data: SocketResponse<T[]>, isSingle: boolean) {
    const { user: { username } } = userStore
    const msg = data.data[0]
    if (!msg) return
    const to = isSingle ? msg.to === username ? msg.from! : msg.to! : msg.to!
    const messageInfo = this.getMessageInfo(to, isSingle ? ChatType.single : ChatType.group)
    const { messages, fakeIdIndexMap } = messageInfo
    let newCount = 0
    data.data.forEach((message: T) => {
      let isNew = false
      console.log('接收到消息', message);
      if (message.from === username) { // 自己发的
        const ownMessage = messages[fakeIdIndexMap[message.fakeId!]]
        if (ownMessage) {
          delete ownMessage.state
          ownMessage.createdAt = message.createdAt
          ownMessage.id = message.id
          if (ownMessage.type === MsgType.audio) { // 音频数据处理
            if (ownMessage.status === MsgStatus.reply) (ownMessage.content as ReplyContent).data = message.content
            else ownMessage.content = message.content
          }
        } else { // 本地没有这条消息
          isNew = true
        }
      } else { // 别人发的
        isNew = true
        newCount++
        // delete message.state
      }
      const fakeIds = [message.fakeId!]
      if (message.type === MsgType.retract) { // 撤回消息
        const msg = messageInfo.messages.find(msg => msg.id === message.content)
        if (msg) {
          msg.status = MsgStatus.retract
          fakeIds.push(msg.fakeId!)
        } else {
          const retractMsgs = storage.getUntreatedRetractMsgInfos()
          retractMsgs.push({ id: message.id, chatType: isSingle ? ChatType.single : ChatType.group })
          storage.setUntreatedRetractMsgInfos(retractMsgs)
        }
      }
      if (isNew) {
        // messageInfo.showedMsgsMinIndex++
        const length = messages.push(message as T) - 1
        fakeIdIndexMap[message.fakeId!] = length
        messageInfo.maxMsgsIndex = messageInfo.loadedMsgsMinIndex + Math.floor((length - 1) / SAVE_MESSAGE_LENGTH)
      }
      this.setToSaveFakeIds(to, fakeIds, isSingle)
    })
    if (isSingle) {
      this.saveChats(data.data[data.data.length - 1], userStore.unameUserMap[to], newCount, ChatType.single)
    } else {
      const groupInfo = await userStore.getGroupIdGroupInfo(to as Groups.Id)
      this.saveChats(data.data[data.data.length - 1], { nickname: groupInfo.name, avatar: groupInfo.avatar }, newCount, ChatType.group)
    }
    this.saveMessages()
    if (!isSingle) await userStore.getUsers([msg.from!])
  },
  addRecSgMsgsListener() {
    chatSocket.addSuccessHandler(REC_SG_MSGS, (data: SocketResponse<SgMsgRes[]>) => this.recMsgSuccessHandler(data, true))
    chatSocket.addErrorHandler(REC_SG_MSGS, (data: SocketResponse<SgMsg>) => {
      const newMessage = data.data
      const messageInfo = userStore.unameMessageInfoMap[newMessage.to!]
      const message = messageInfo.messages[messageInfo.fakeIdIndexMap[newMessage.fakeId!]]
      message.state = MsgState.error
    })
  },
  setToSaveFakeIds(to: Users.Username | Groups.Id, fakeIds: SgMsgs.FakeId[], isSingle: boolean) {
    const map = isSingle ? this.globalData.toSaveUnameFakeIdsMap : this.globalData.toSaveGroupIdFakeIdsMap
    const fakeIdSet = map[to] || new Set()
    fakeIds.forEach(fakeId => fakeIdSet.add(fakeId))
    map[to] = fakeIdSet
    // if (isSingle) {
    //   const _fakeIds = this.globalData.toSaveUnameFakeIdsMap[to] || []
    //   _fakeIds.push(...fakeIds)
    //   this.globalData.toSaveUnameFakeIdsMap[to] = _fakeIds
    // } else {
    //   const _fakeIds = this.globalData.toSaveGroupIdFakeIdsMap[to] || []
    //   _fakeIds.push(...fakeIds)
    //   this.globalData.toSaveGroupIdFakeIdsMap[to] = _fakeIds
    // }
  },
  addRecGpMsgsListener() {
    chatSocket.addSuccessHandler(REC_GP_MSGS, (data: SocketResponse<GpMsgRes[]>) => this.recMsgSuccessHandler(data, false))
    chatSocket.addErrorHandler(REC_GP_MSGS, (data: SocketResponse<GpMsg>) => {
      const newMessage = data.data
      const messageInfo = userStore.groupIdMessageInfoMap[newMessage.to!]
      const message = messageInfo.messages[messageInfo.fakeIdIndexMap[newMessage.fakeId!]]
      message.state = MsgState.error
    })
  },
  isAtChatDetailPage() {
    const pages = getCurrentPages()
    return '/' + pages[pages.length - 1].route === ChatDetailPath
  },
  saveChats(message: SgMsg | GpMsg, target: { nickname: string, avatar: string }, newCount: number, chatType: ChatType) {
    const isChatDetailPath = this.isAtChatDetailPage()
    const content = message.type === MsgType.audio ? '' : message.content
    const { from, to } = this.getRealFromTo(message.from!, message.to!)
    const chat: ChatItem = {
      nickname: target.nickname,
      avatar: target.avatar,
      content,
      createdAt: message.createdAt!,
      newCount,
      type: message.type,
      from,
      to,
      chatType,
      state: message.state,
      isTop: false
    }
    if (!message.to) console.error('chat to error', message, target, newCount, chatType)
    const { chats } = userStore
    const index = chats.findIndex(chat => chat.nickname === target.nickname)
    if (index > -1) {
      chat.newCount = isChatDetailPath ? 0 : chats[index].newCount + newCount
      chat.isTop = chats[index].isTop
      chats.splice(index, 1)
    }
    chat.isTop ? chats.unshift(chat) : chats.splice(chats.findIndex(c => !c.isTop), 0, chat)
    userStore.setChats([...chats])
    wx.setStorageSync('chats-' + userStore.user.username, JSON.stringify(chats))
  },
  // 缓存消息
  saveMessages() {
    if (this.globalData.saveStatus !== 'pending') {
      setTimeout(this.saveMessagesHandler.bind(this), 2000)
      this.globalData.saveStatus = 'pending'
    }
  },
  saveMessagesHandler() {
    const { username } = userStore.user
    const handler = <T extends SgMsg | GpMsg>(to: Users.Username | GpMsgs.Id, chatType: ChatType, messageInfo: MessageInfo<T>) => {
      const prefixKey = username + '-' + chatType + '-' + to + '-'
      const pages = new Set<number>();
      (chatType === ChatType.single ? this.globalData.toSaveUnameFakeIdsMap : this.globalData.toSaveGroupIdFakeIdsMap)[to].forEach(fakeId => {
        pages.add(Math.floor(messageInfo.fakeIdIndexMap[fakeId] / SAVE_MESSAGE_LENGTH) + messageInfo.loadedMsgsMinIndex)
      })
      console.log(pages)
      for (const i of pages) {
        if (i > messageInfo.maxMsgsIndex) messageInfo.maxMsgsIndex = i
        const left = (i - messageInfo.loadedMsgsMinIndex) * SAVE_MESSAGE_LENGTH
        wx.setStorageSync(prefixKey + i, JSON.stringify(messageInfo.messages.slice(left, left + SAVE_MESSAGE_LENGTH)))
      }
      wx.setStorageSync(prefixKey + 'i', messageInfo.maxMsgsIndex + '')
    }

    Object.keys(this.globalData.toSaveUnameFakeIdsMap).forEach(to => handler(to, ChatType.single, userStore.unameMessageInfoMap[to]))
    Object.keys(this.globalData.toSaveGroupIdFakeIdsMap).forEach(to => handler(to, ChatType.group, userStore.groupIdMessageInfoMap[to]))
    this.globalData.toSaveUnameFakeIdsMap = {}
    this.globalData.toSaveGroupIdFakeIdsMap = {}
    this.globalData.saveStatus = ''
  },
  // 已读消息
  addReadMsgsListener() {
    chatSocket.addSuccessHandler(READ_SG_MSGS, data => this.readMsgsHandler(data, true))
    chatSocket.addSuccessHandler(READ_GP_MSGS, data => this.readMsgsHandler(data, false))
  },
  getRealFromTo(from: GpMsgs.From | GpMsgs.To, to: GpMsgs.From | GpMsgs.To) {
    return userStore.user.username === from ? { from, to } : { from: to as GpMsgs.From, to: from }
  },
  readMsgsHandler(data: SocketResponse, isSingle: boolean) {
    const chatType = isSingle ? ChatType.single : ChatType.group
    const { ids, from: _from, to: _to } = data.data as ReadSgMsgsRes | ReadGpMsgsRes
    const { to } = this.getRealFromTo(_from, _to)
    const messageInfo = this.getMessageInfo(to, chatType)
    const fakeIds: SgMsgs.FakeId[] = []
    ids.forEach(id => {
      const msg = messageInfo.messages.find(msg => msg.id === id)
      console.log('消息已读', msg, messageInfo, id)
      if (msg) {
        isSingle ? msg.read = MsgRead.yes : (msg as GpMsg).readCount!++
        fakeIds.push(msg.fakeId!)
      } else {
        const untreatedReadMsgInfos = storage.getUntreatedReadMsgInfos()
        untreatedReadMsgInfos.push({ id, chatType })
        storage.setUntreatedReadMsgInfos(untreatedReadMsgInfos)
      }
    })
    this.setToSaveFakeIds(to, fakeIds, isSingle)
    this.saveMessages()
  },
})
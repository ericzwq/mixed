import {createStoreBindings} from 'mobx-miniprogram-bindings'
import {formatDate, handleMsg} from './common/utils'
import {ChatDetailPath, LoginPath} from './consts/routes'
import {chatSocket} from "./socket/socket"
import {REC_GP_MSGS, REC_SG_MSGS, SEARCH_USERS} from './socket/socket-actions'
import {userStore} from "./store/user"
import {ChatType, MsgType} from './socket/socket-types'

App<IAppOption>({
  globalData: {
    toSaveUnameFakeIdsMap: {} as { [k in string]: SgMsgs.FakeId[] },
    toSaveGroupIdFakeIdsMap: {} as { [k in string]: SgMsgs.FakeId[] },
    saveStatus: '',
  },
  onLaunch() {
    createStoreBindings({setData: () => 0}, {
      store: userStore,
      actions: ['setUser', 'getContacts']
    })
    this.addRecSgMsgsListener()
    this.addRecGpMsgsListener()
    if (!this.getUser()) return
    chatSocket.connect().then(() => userStore.init())
  },
  // 获取用户信息
  getUser() {
    const user = wx.getStorageSync('user')
    if (!user) {
      chatSocket.close('无用户信息')
      wx.navigateTo({url: LoginPath})
    } else {
      userStore.setUser(JSON.parse(user))
    }
    return !!user
  },
  addRecSgMsgsListener() {
    chatSocket.addSuccessHandler(REC_SG_MSGS, (data: SocketResponse<SgMsg[]>) => {
      const {unameMessageInfoMap} = userStore
      const msg = data.data[0]
      if (!msg) return
      const targetUname = msg.to === userStore.user.username ? msg.from : msg.to
      let messageInfo = unameMessageInfoMap[targetUname!]
      if (!messageInfo) {
        messageInfo = {
          messages: [],
          fakeIdIndexMap: {},
          loadedMessagesMinIndex: -1,
          loadedMessagesPageMinIndex: Infinity,
          maxMessagesIndex: 0
        }
        unameMessageInfoMap[targetUname!] = messageInfo
      }
      const {messages, fakeIdIndexMap} = messageInfo
      data.data.forEach((message: SgMsg) => {
        const ownMessage = messages[fakeIdIndexMap[message.fakeId!]]
        console.log('接收到消息', message, ownMessage);
        if (ownMessage) { // 自己发的
          delete ownMessage.state
          ownMessage.createdAt = message.createdAt
          if (ownMessage.type === MsgType.audio) { // 音频数据处理
            ownMessage.content = message.content
          }
        } else { // 别人发的
          delete message.state
          fakeIdIndexMap[message.fakeId!] = messages.push(message) - 1
          // const length = this.data.viewMessages.push(message)
          // this.data.viewMessages.splice(length - 2, 2, ...this.handleViewMessageTime(
          //   undefined,
          //   length - 2))
        }
        const fakeIds = this.globalData.toSaveUnameFakeIdsMap[targetUname!] || []
        fakeIds.push(message.fakeId!)
        this.globalData.toSaveUnameFakeIdsMap[targetUname!] = fakeIds
        handleMsg(message)
      })
      this.saveChats(data.data[data.data.length - 1], userStore.unameUserMap[targetUname!], data.data.length, ChatType.single)
      this.saveMessages()
    })
    chatSocket.addErrorHandler(REC_SG_MSGS, (data: SocketResponse<SgMsg>) => {
      const newMessage = data.data
      const messageInfo = userStore.unameMessageInfoMap[newMessage.to!]
      const message = messageInfo.messages[messageInfo.fakeIdIndexMap[newMessage.fakeId!]]
      message.state = 'error'
    })
  },
  addRecGpMsgsListener() {
    chatSocket.addSuccessHandler(REC_GP_MSGS, async (data: SocketResponse<GpMsg[]>) => {
      console.log('群聊消息', data)
      const {groupIdMessageInfoMap, unameUserMap, user: {username}} = userStore
      const msg = data.data[0] as Required<GpMsg>
      if (!msg) return
      const {to, from} = msg
      let messageInfo = groupIdMessageInfoMap[to]
      if (!messageInfo) {
        messageInfo = {
          messages: [],
          fakeIdIndexMap: {},
          loadedMessagesMinIndex: -1,
          loadedMessagesPageMinIndex: Infinity,
          maxMessagesIndex: 0
        }
        groupIdMessageInfoMap[to] = messageInfo
      }
      const {messages, fakeIdIndexMap} = messageInfo
      data.data.forEach((message: GpMsg) => {
        const ownMessage = messages[fakeIdIndexMap[message.fakeId!]]
        console.log('接收到消息', message, ownMessage);
        if (ownMessage) { // 自己发的
          delete ownMessage.state
          ownMessage.createdAt = message.createdAt
          if (ownMessage.type === MsgType.audio) { // 音频数据处理
            ownMessage.content = message.content
          }
        } else { // 别人发的
          delete message.state
          fakeIdIndexMap[message.fakeId!] = messages.push(message) - 1
          // const length = this.data.viewMessages.push(message)
          // this.data.viewMessages.splice(length - 2, 2, ...this.handleViewMessageTime(
          //   undefined,
          //   length - 2))
        }
        const fakeIds = this.globalData.toSaveGroupIdFakeIdsMap[to] || []
        fakeIds.push(message.fakeId!)
        this.globalData.toSaveGroupIdFakeIdsMap[to] = fakeIds
        handleMsg(message)
      })
      const groupInfo = await userStore.getGroupIdGroupInfo(to)
      this.saveChats(data.data[data.data.length - 1], {nickname: groupInfo.name, avatar: groupInfo.avatar}, data.data.length, ChatType.group)
      this.saveMessages()
      if (!unameUserMap[from]) {
        await chatSocket.send({action: SEARCH_USERS, data: {username: from}})
        const handler = (data: SocketResponse<User[]>) => {
          chatSocket.removeSuccessHandler(SEARCH_USERS, handler)
          if (!data.data.length) return console.error('无该用户信息', from, data)
          const {nickname, avatar, email} = data.data[0]
          unameUserMap[from] = {nickname, avatar, email}
          userStore.setUnameUserMap(unameUserMap)
          wx.setStorageSync('unameUserMap-' + username, JSON.stringify(unameUserMap))
        }
        chatSocket.addSuccessHandler(SEARCH_USERS, handler)
      }
    })
    chatSocket.addErrorHandler(REC_GP_MSGS, (data: SocketResponse<GpMsg>) => {
      const newMessage = data.data
      const messageInfo = userStore.groupIdMessageInfoMap[newMessage.to!]
      const message = messageInfo.messages[messageInfo.fakeIdIndexMap[newMessage.fakeId!]]
      message.state = 'error'
    })
  },
  saveChats(message: SgMsg | GpMsg, target: { nickname: string, avatar: string }, newCount: number, chatType: ChatType) {
    console.log(target)
    const pages = getCurrentPages()
    const isChatDetailPath = '/' + pages[pages.length - 1].route === ChatDetailPath
    const content = message.type === MsgType.audio ? '' : message.content
    const chat: ChatItem = {
      nickname: target.nickname,
      avatar: target.avatar,
      content,
      createdAt: formatDate(),
      newCount,
      type: message.type,
      from: message.from!,
      to: message.to!,
      chatType
    }
    const index = userStore.chats.findIndex(chat => chat.nickname === target.nickname)
    if (index > -1) {
      chat.newCount = isChatDetailPath ? 0 : userStore.chats[index].newCount + newCount
      userStore.chats.splice(index, 1)
    }
    userStore.chats.unshift(chat)
    userStore.setChats([...userStore.chats])
    wx.setStorageSync('chats-' + userStore.user.username, JSON.stringify(userStore.chats))
  },
  // 缓存消息
  saveMessages() {
    if (this.globalData.saveStatus !== 'pending') {
      setTimeout(this.saveMessagesHandler.bind(this), 2000)
      this.globalData.saveStatus = 'pending'
    }
  },
  saveMessagesHandler() {
    const length = 16
    const handler = <T extends SgMsg | GpMsg>(to: Users.Username | GpMsgs.Id, chatType: ChatType, messageInfo: MessageInfo<T>) => {
      const prefixKey = chatType + '-' + to + '-'
      const pages = new Set<number>()
      if (!messageInfo) {
        const index = wx.getStorageSync(prefixKey + 'i')
        messageInfo = {
          fakeIdIndexMap: {},
          messages: [],
          maxMessagesIndex: 0, // messages最大本地缓存分页索引
          loadedMessagesMinIndex: -1, // messages已加载本地缓存分页最小索引
          loadedMessagesPageMinIndex: Infinity, // 本地缓存中已加载的分页最小索引
        }
        if (index) {
          messageInfo.messages = JSON.parse(wx.getStorageSync(prefixKey + index))
          messageInfo.messages.forEach((v, i) => messageInfo.fakeIdIndexMap[v.fakeId!] = i)
          messageInfo.maxMessagesIndex = +(index || 0)
          messageInfo.loadedMessagesMinIndex = messageInfo.maxMessagesIndex
          messageInfo.loadedMessagesPageMinIndex = 0
        }
      }
      let start = length - messageInfo.loadedMessagesPageMinIndex - 1
      if (start === -Infinity) start = -1; // 无缓存
      (chatType === ChatType.single ? this.globalData.toSaveUnameFakeIdsMap : this.globalData.toSaveGroupIdFakeIdsMap)[to].forEach(fakeId => {
        const index = (messageInfo.fakeIdIndexMap[fakeId] - start) / length
        // console.log(messageInfo.fakeIdIndexMap[fakeId], start, index, messageInfo.loadedMessagesPageMinIndex)
        // const page = (index > 0 ? Math.ceil(index) : Math.floor(index)) + messageInfo.loadedMessagesIndex + 1
        // if (index < 0) console.error(index)
        const page = Math.ceil(index) + messageInfo.loadedMessagesMinIndex
        pages.add(page)
      })
      console.log(pages, messageInfo)
      for (const i of pages) {
        if (i > messageInfo.maxMessagesIndex) messageInfo.maxMessagesIndex = i
        const left = start + 1 + length * (i - messageInfo.loadedMessagesMinIndex - 1)
        // console.log(messageInfo.messages[messageInfo.messages.length - 1].data, left, start, i, messageInfo.messages.length)
        wx.setStorageSync(prefixKey + i, JSON.stringify(messageInfo.messages.slice(left, left + length)))
      }
      wx.setStorageSync(prefixKey + 'i', messageInfo.maxMessagesIndex + '')
    }
    Object.keys(this.globalData.toSaveUnameFakeIdsMap).forEach(to => handler(to, ChatType.single, userStore.unameMessageInfoMap[to]))
    Object.keys(this.globalData.toSaveGroupIdFakeIdsMap).forEach(to => handler(to, ChatType.group, userStore.groupIdMessageInfoMap[to]))
    this.globalData.toSaveUnameFakeIdsMap = {}
    this.globalData.saveStatus = ''

    //   const data = []
    //   const length = 16
    //   Object.keys(this.data._toSaveUnameFakeIdsMap).forEach(to => {
    //     const prefixKey = to + '-'
    //     const pages = new Set<number>()
    //     let maxIndex = wx.getStorageSync(prefixKey + 'i')
    //     const messages = (maxIndex ? JSON.parse(wx.getStorageSync(prefixKey + maxIndex)) : []) as Message[]
    //     messages.push(...this.data._toSaveUnameFakeIdsMap[to])
    //     let loadedMessagesPageMinIndex = +(maxIndex || Infinity), loadedMessagesIndex = +(maxIndex || -1), maxMessagesIndex = +(maxIndex || 0)
    //     let start = length - loadedMessagesPageMinIndex - 1
    //     if (start === -Infinity) start = -1 // 无缓存
    //     messages.forEach((_message, i) => {
    //       // const index = (this.data._messagesMap[message] - start) / length
    //       const index = (i - start) / length
    //       // const page = Math.ceil(index) + this.data._loadedMessagesIndex
    //       const page = Math.ceil(index) + +maxIndex
    //       pages.add(page)
    //     })
    //     console.log(pages)
    //     for (const i of pages) {
    //       if (i > maxMessagesIndex) maxMessagesIndex = i
    //       const left = start + 1 + length * (i - loadedMessagesIndex - 1)
    //       // console.log(this.messages[this.messages.length - 1].data, left, start, i, this.messages.length)
    //       wx.setStorageSync(prefixKey + i, JSON.stringify(messages.slice(left, left + length)))
    //     }
    //     wx.setStorageSync(prefixKey + 'i', maxMessagesIndex + '')
    //   })
    //   this.data._toSaveUnameFakeIdsMap = {}
    //   this.data._saveStatus = ''
  },
})
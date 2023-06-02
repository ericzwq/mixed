import {createStoreBindings} from 'mobx-miniprogram-bindings'
import {userStore} from '../../store/user'
import {BASE_URL, LOAD_MESSAGE_COUNT} from '../../consts/consts'
import {chatSocket} from '../../socket/socket'
import {formatDate, formatDetailDate} from '../../common/utils'
import {REC_GP_MSGS, REC_SG_MSGS, SEND_SG_MSG} from '../../socket/socket-actions'
import {GroupInfoPath, SingleInfoPath, UserDetailPath} from '../../consts/routes'
import {ChatType, MsgType, MsgState} from '../../socket/socket-types'

const app = getApp<IAppOption>()
Page({
  // options: {
  // pureDataPattern: /^_/
  // },
  data: {
    target: {} as Contact | GroupInfo, // 目标用户
    content: '',
    keyboardUp: false,
    windowHeight: 0,
    chatType: ChatType.single,
    STATIC_BASE_URL: BASE_URL,
    viewMessages: [] as SgMsg[] | GpMsg[],
    saveTime: 0,
    // _saveStatus: '',
    inputState: 0 as ChatInputState, // 0键盘 1语音
    recordState: 0 as ChatRecordState, // 0未开始(无数据) 1录制中 2录制完
    _recorderManager: wx.getRecorderManager(),
    _recordFilePath: '',
    _innerAudioContext: null as any as WechatMiniprogram.InnerAudioContext,
    _audioPlayIndex: -1, // 音频播放的索引
    showOpts: false,
    voiceTarget: null,
    offer: null,
    rtc1: null,
    rtc2: null,
    isMuted: false,
    noMicoff: false,
    noVideo: false,
    localStream: null,
    remoteStream: null,
    callState: 0 as ChatCallState, // 1主动方 2接收方
    audioSender: [],
    videoSender: [],
    audioPlayState: 0 as ChatAudioPlayState, // 0 未播放 1播放中
    title: '',
    showHoverBtn: false,
    activeIndex: -1,
    left: '',
    right: '',
    top: '',
    bottom: '',
    isActive: false
  },
  storeBindings: {} as StoreBindings,
  containerTap(e: WechatMiniprogram.CustomEvent) {
    if (e.target.id !== 'showOpt' && !e.mark!['opts']) {
      this.setData({showOpts: false})
    }
    // setTimeout(() => e.target.focus(), 500) todo
  },
  toDetail(e: WechatMiniprogram.CustomEvent) {
    wx.navigateTo({url: UserDetailPath + '?username=' + this.data.viewMessages[e.currentTarget.dataset.i].from})
  },
  onLoad(query: { to: string, type: ChatType }) {
    this.addSgMsgListener()
    this.addGpMsgListener()
    const {to, type} = query
    this.storeBindings = createStoreBindings(this, {
      store: userStore,
      fields: ['user', 'unameUserMap'],
    })
    let target: Contact | GroupInfo, title: string, plus = ''
    new Promise<void>(resolve => {
      if (type === ChatType.single) {
        target = {...userStore.unameUserMap[to], username: to} as Contact
        if (!target) return
        title = target.nickname!
        resolve()
      } else {
        userStore.getGroupIdGroupInfo(+to).then(groupInfo => {
          target = groupInfo
          title = groupInfo.name
          plus = '（' + groupInfo.count + '）'
          resolve()
        })
      }
    }).then(() => {
      this.setData({target, chatType: type, title: title + plus})
      this.clearChat()
      wx.setNavigationBarTitle({title})
      this.loadInitMessage()
    })
  },
  onReady() {
    const iac = wx.createInnerAudioContext()
    iac.onEnded(() => {
      this.data.viewMessages[this.data._audioPlayIndex].isPlay = false
      this.setData({audioPlayState: 0, viewMessages: this.data.viewMessages})
    })
    iac.onPause(() => {
      this.setData({audioPlayState: 0})
    })
    iac.onPlay(() => {
      this.setData({audioPlayState: 1})
    })
    iac.onError((res) => {
      console.log('音频播放异常', res)
      this.data.viewMessages[this.data._audioPlayIndex].isPlay = false
      wx.showToast({title: '音频播放异常'})
      this.setData({audioPlayState: 0, viewMessages: this.data.viewMessages})
    })
    this.data._recorderManager.onStop(listener => this.setData({_recordFilePath: listener.tempFilePath}))
    this.data._recorderManager.onError(e => {
      console.log('音频录制异常', e)
      wx.showToast({title: e.errMsg})
    })
    this.setData({_innerAudioContext: iac, windowHeight: wx.getWindowInfo().windowHeight})
    wx.onWindowResize(e => {
      this.setData({keyboardUp: this.data.windowHeight > e.size.windowHeight, windowHeight: e.size.windowHeight})
      setTimeout(() => this.scrollView(0))
    })
    this.scrollView(0)
  },
  onUnload() {
    this.storeBindings.destroyStoreBindings()
    chatSocket.removeSuccessHandler(REC_SG_MSGS, this.sgMsgSuccessHandler)
    chatSocket.removeErrorHandler(REC_SG_MSGS, this.sgMsgErrorHandler)
  },
  onPullDownRefresh() {
    this.loadMoreMessage()
  },
  toUserDetail(e: WechatMiniprogram.CustomEvent) {
    const {right, i} = e.target.dataset
    const {target, chatType, viewMessages} = this.data
    let username!: Users.Username
    if (right) {
      username = userStore.user.username
    } else {
      if (chatType === ChatType.single) {
        username = (target as Contact).username
      } else {
        username = viewMessages[i].from!
      }
    }
    wx.navigateTo({url: UserDetailPath + '?username=' + username})
  },
  contentInput() {
  },
  // 静音
  handleMute() {
    this.data.isMuted = !this.data.isMuted
    if (this.data.isMuted) {
      // this.selectComponent('remoteVideo').$el.querySelector('video').setAttribute('muted', true)
    } else {
      // this.selectComponent('remoteVideo').$el.querySelector('video').remoteAttribute('muted')
    }
  },
  // 取消呼叫
  cancelCall() {
    this.setData({callState: 0})
  },
  handleMic() {
    this.setData({inputState: 1})
  },
  // 麦克风
  handleMicoff() {
    this.data.noMicoff = !this.data.noMicoff
    // if (this.data.noMicoff) {
    //   if (this.data.callState === 1) {
    //     this.data.audioSender.forEach(sender => this.data.rtc1.removeTrack(sender))
    //   } else if (this.data.callState === 2) {
    //     this.data.audioSender.forEach(sender => this.data.rtc2.removeTrack(sender))
    //   }
    //   this.data.audioSender = []
    // } else {
    //   this.data.localStream.getTracks().forEach(track => {
    //     if (track.kind === 'audio') {
    //       let sender
    //       if (this.data.callState === 1) {
    //         sender = this.data.rtc1.addTrack(track, this.data.localStream)
    //       } else if (this.data.callState === 2) {
    //         sender = this.data.rtc1.addTrack(track, this.data.localStream)
    //       }
    //       this.data.audioSender.push(sender)
    //     }
    //   })
    // }

  },
  // 摄像头
  handleVideo() {
    this.data.noVideo = !this.data.noVideo
    // if (this.data.noVideo) {
    //   if (this.data.callState === 1) {
    //     this.data.videoSender.forEach(sender => this.data.rtc1.removeTrack(sender))
    //   } else if (this.data.callState === 2) {
    //     this.data.videoSender.forEach(sender => this.data.rtc2.removeTrack(sender))
    //   }
    //   this.data.videoSender = []
    // } else {
    //   this.data.localStream.getTracks().forEach(track => {
    //     if (track.kind === 'video') {
    //       let sender
    //       if (this.data.callState === 1) {
    //         sender = this.data.rtc1.addTrack(track, this.data.localStream)
    //       } else if (this.data.callState === 2) {
    //         sender = this.data.rtc1.addTrack(track, this.data.localStream)
    //       }
    //       this.data.videoSender.push(sender)
    //     }
    //   })
    // }
  },
  // 接收端确认
  dialogInputConfirm() {
    this.data.callState = 2
    // this.$refs['calling'].open()
    wx.nextTick(() => {
      //   navigator.mediaDevices.getUserMedia({
      //     video: true,
      //     audio: true
      //   }).then(stream => {
      //     this.$refs['localVideo'].$el.querySelector('video').srcObject = stream
      //     console.log(stream.getTracks())
      //     this.localStream = stream
      //     const rtc = new RTCPeerConnection()
      //     this.rtc2 = rtc
      //     rtc.addEventListener('track', e => {
      //       if (e.streams.length) {
      //         this.remoteStream = e.streams[0]
      //         this.$refs['remoteVideo'].$el.querySelector('video').srcObject = e
      //           .streams[0]
      //       }
      //     })
      //     rtc.addEventListener('icecandidate', e => {
      //       const {
      //         candidate
      //       } = e
      //       if (candidate) {
      //         rtc.addIceCandidate(candidate)
      //         chatSocket.send({
      //           action: CANDIDATE,
      //           data: {
      //             candidate,
      //             from: this.user.username,
      //             to: this.target.username
      //           }
      //         })
      //       }
      //     })
      //     rtc.setRemoteDescription(this.offer)
      //     stream.getTracks().forEach(track => {
      //       const sender = rtc.addTrack(track, stream)
      //       if (track.kind === 'audio') {
      //         this.audioSender.push(sender)
      //       } else if (track.kind === 'video') {
      //         this.videoSender.push(sender)
      //       }
      //     })
      //     rtc.createAnswer().then(answer => {
      //       rtc.setLocalDescription(answer)
      //       chatSocket.send({
      //         action: ANSWER,
      //         data: {
      //           answer,
      //           from: this.user.username,
      //           to: this.target.username
      //         }
      //       })
      //     })
      //   }, e => {
      //     uni.showToast({
      //       title: e.message
      //     })
      //     console.log('音频录制异常', e)
      //   })
    })
  },
  dialogInputClose() {
    // chatSocket.send({
    //   action: VOICE_RESULT,
    //   data: {
    //     from: this.user.username,
    //     agree: false,
    //     to: this.voiceTarget.from
    //   }
    // })
  },
  handleShowOpts() {
    this.setData({showOpts: !this.data.showOpts})
  },
  // 语音通话
  handleVoiceCall() {
    this.data.callState = 1
    // this.$refs['calling'].open()
    // this.$nextTick(() => {
    //   navigator.mediaDevices.getUserMedia({
    //     video: true,
    //     audio: true
    //   }).then(stream => {
    //     this.localStream = stream
    //     this.$refs['localVideo'].$el.querySelector('video').srcObject = stream
    //     const rtc = new RTCPeerConnection()
    //     this.rtc1 = rtc
    //     rtc.addEventListener('track', e => {
    //       if (e.streams.length) {
    //         this.remoteStream = e.streams[0]
    //         this.$refs['remoteVideo'].$el.querySelector('video').srcObject = e
    //           .streams[0]
    //       }
    //     })
    //     rtc.addEventListener('icecandidate', e => {
    //       const {
    //         candidate
    //       } = e
    //       if (candidate) {
    //         rtc.addIceCandidate(candidate)
    //         chatSocket.send({
    //           action: CANDIDATE,
    //           data: {
    //             candidate,
    //             from: this.user.username,
    //             to: this.target.username
    //           }
    //         })
    //       }
    //     })
    //     stream.getTracks().forEach(track => {
    //       const sender = rtc.addTrack(track, stream)
    //       if (track.kind === 'audio') {
    //         this.audioSender.push(sender)
    //       } else if (track.kind === 'video') {
    //         this.videoSender.push(sender)
    //       }
    //     })
    //     rtc.createOffer().then(offer => {
    //       rtc.setLocalDescription(offer)
    //       chatSocket.send({
    //         action: OFFER,
    //         data: {
    //           offer,
    //           from: this.user.username,
    //           to: this.target.username
    //         }
    //       })
    //     })
    //   }, e => {
    //     uni.showToast({
    //       title: e.message
    //     })
    //     console.log('音频录制异常', e)
    //   })
    // })
  },
  // 首屏获取本地消息
  loadInitMessage() {
    const {chatType} = this.data
    const {username} = userStore.user
    const to = this.getTo()
    const prefixKey = username + '-' + chatType + '-' + to + '-'
    const messageInfo = this.getMessageInfo(to)
    const index = wx.getStorageSync(prefixKey + 'i')
    messageInfo.maxMessagesIndex = +(index || 0)
    console.log(messageInfo.messages, messageInfo.maxMessagesIndex, messageInfo.loadedMessagesMinIndex, messageInfo.loadedMessagesPageMinIndex, prefixKey, index)
    if (messageInfo.messages && messageInfo.messages.length >= LOAD_MESSAGE_COUNT) { // 如果全局有足够的消息数量则直接从内存中取
      const rest = messageInfo.messages.length - LOAD_MESSAGE_COUNT
      messageInfo.messages = messageInfo.messages.slice(messageInfo.messages.length - LOAD_MESSAGE_COUNT)
      this.data.viewMessages = this.handleViewMessageTime(messageInfo.messages) as SgMsg[]
      messageInfo.loadedMessagesMinIndex += Math.floor(rest / LOAD_MESSAGE_COUNT)
      messageInfo.loadedMessagesPageMinIndex += rest % LOAD_MESSAGE_COUNT
      console.log(messageInfo.maxMessagesIndex, messageInfo.loadedMessagesMinIndex, messageInfo.loadedMessagesPageMinIndex)
      // this.data.viewMessages = this.handleViewMessageTime(messageInfo.messages)
    } else { // 从缓存中读取
      if (index) { // 有本地消息
        messageInfo.loadedMessagesMinIndex = messageInfo.maxMessagesIndex
        const messages = JSON.parse(wx.getStorageSync(prefixKey + messageInfo.maxMessagesIndex))
        console.log(messages.length, LOAD_MESSAGE_COUNT, messageInfo.maxMessagesIndex)
        if (messages.length < LOAD_MESSAGE_COUNT && messageInfo.maxMessagesIndex > 0) { // 消息不够loadMessageCount从上一页加载
          const lastMessages = JSON.parse(wx.getStorageSync(prefixKey + (--messageInfo.loadedMessagesMinIndex)))
          messageInfo.loadedMessagesPageMinIndex = lastMessages.length - (LOAD_MESSAGE_COUNT - messages.length)
          messageInfo.messages = lastMessages.slice(messageInfo.loadedMessagesPageMinIndex).concat(messages)
        } else { // 取本页数据
          if (messageInfo.maxMessagesIndex === 0) {
            messageInfo.loadedMessagesPageMinIndex = 0
          } else {
            messageInfo.loadedMessagesPageMinIndex = messages.length - LOAD_MESSAGE_COUNT
          }
          messageInfo.messages = messages.slice(messageInfo.loadedMessagesPageMinIndex)
        }
      } else {
        messageInfo.messages = []
        messageInfo.fakeIdIndexMap = {}
        messageInfo.loadedMessagesMinIndex = -1
        messageInfo.maxMessagesIndex = 0
        messageInfo.loadedMessagesPageMinIndex = Infinity
      }
    }
    if (chatType === ChatType.single) {
      userStore.unameMessageInfoMap[to] = messageInfo as MessageInfo<SgMsg>
    } else {
      userStore.groupIdMessageInfoMap[to] = messageInfo as MessageInfo<GpMsg>
    }
    this.data.viewMessages = this.handleViewMessageTime(messageInfo.messages) as SgMsg[]
    console.log(this.data.viewMessages, prefixKey)
    this.setData({viewMessages: this.data.viewMessages})
    this.resetMessagesMap(messageInfo)
  },
  // 获取更多消息
  loadMoreMessage() {
    const {chatType} = this.data
    const {username} = userStore.user
    const to = this.getTo()
    const prefixKey = username + '-' + chatType + '-' + to + '-'
    const messageInfo = this.getMessageInfo(to)
    let preMessages!: SgMsg[]
    if (messageInfo.loadedMessagesPageMinIndex >= LOAD_MESSAGE_COUNT) { // 本页数据够
      const messages = JSON.parse(wx.getStorageSync(prefixKey + (messageInfo.loadedMessagesMinIndex)))
      messageInfo.loadedMessagesPageMinIndex -= LOAD_MESSAGE_COUNT
      preMessages = messages.slice(messageInfo.loadedMessagesPageMinIndex, messageInfo.loadedMessagesPageMinIndex +
        LOAD_MESSAGE_COUNT)
      messageInfo.messages = preMessages.concat(messageInfo.messages as SgMsg[])
    } else if (messageInfo.loadedMessagesMinIndex === 0) { // 到顶 todo 最后一项
      if (messageInfo.loadedMessagesPageMinIndex > 0) {
        const messages = JSON.parse(wx.getStorageSync(prefixKey + (messageInfo.loadedMessagesMinIndex)))
        preMessages = messages.slice(0, messageInfo.loadedMessagesPageMinIndex)
        messageInfo.messages = preMessages.concat(messageInfo.messages as SgMsg[])
        messageInfo.loadedMessagesPageMinIndex = 0
      }
    } else { // 本页数据不够
      const messages = JSON.parse(wx.getStorageSync(prefixKey + messageInfo.loadedMessagesMinIndex))
      const lastMessages = JSON.parse(wx.getStorageSync(prefixKey + (--messageInfo.loadedMessagesMinIndex)))
      const _loadedMessagesPageMinIndex = messageInfo.loadedMessagesPageMinIndex
      messageInfo.loadedMessagesPageMinIndex = lastMessages.length - (LOAD_MESSAGE_COUNT - messageInfo.loadedMessagesPageMinIndex)
      preMessages = lastMessages.slice(messageInfo.loadedMessagesPageMinIndex).concat(messages.slice(0,
        _loadedMessagesPageMinIndex))
      messageInfo.messages = preMessages.concat(messageInfo.messages as SgMsg[])
    }
    // console.log(this.loadedMessagesPageMinIndex, this.loadedMessagesIndex, this.messages.length)
    if (preMessages) {
      const preViewMessages = this.handleViewMessageTime(preMessages) as SgMsg[]
      const viewMessages = this.data.viewMessages
      if (viewMessages.length && !this.cmpTime(preViewMessages[preViewMessages.length - 1].createdAt!,
        viewMessages[0].createdAt!)) {
        viewMessages.shift() // 删除间隔时间
      }
      this.setData({viewMessages: preViewMessages.concat(viewMessages as SgMsg[])})
    }
    this.resetMessagesMap(messageInfo)
    wx.stopPullDownRefresh()
  },
  resetMessagesMap(messageInfo: MessageInfo<SgMsg> | MessageInfo<GpMsg>) {
    messageInfo.fakeIdIndexMap = {}
    messageInfo.messages.forEach((v: SgMsg | GpMsg, i: number) => messageInfo.fakeIdIndexMap[v.fakeId!] = i)
    // userStore.setUnameMessageInfoMap({ ...userStore.unameMessageInfoMap })
  },
  sgMsgSuccessHandler: (_data: SocketResponse) => {
  },
  sgMsgErrorHandler: (_data: SocketResponse) => {
  },
  // 注册单聊消息监听
  addSgMsgListener() {
    this.sgMsgSuccessHandler = ((data: SocketResponse<SgMsg[]>) => {
      const viewMessages = this.data.viewMessages as SgMsg[]
      data.data.forEach((message: SgMsg) => {
        if (message.from === userStore.user.username) { // 自己发的
          const ownMessage = viewMessages.find(msg => msg.fakeId === message.fakeId)!
          delete ownMessage.state
          ownMessage.createdAt = message.createdAt
        } else { // 别人发的
          const length = viewMessages.push(message as SgMsg)
          viewMessages.splice(length - 2, 2, ...this.handleViewMessageTime(undefined, length - 2) as SgMsg[])
        }
      })
      this.setData({viewMessages: this.data.viewMessages,})
      this.scrollView()
      app.saveMessages()
    })
    this.sgMsgErrorHandler = (data: SocketResponse<SgMsg>) => {
      const messageInfo = userStore.unameMessageInfoMap[data.data.to!]
      const message = messageInfo.messages[messageInfo.fakeIdIndexMap[data.data.fakeId!]]
      message.state = MsgState.error
      // userStore.setUnameMessageInfoMap({ ...userStore.unameMessageInfoMap })
      // this.setData({ viewMessages: this.data.viewMessages })
    }
    chatSocket.addSuccessHandler(REC_SG_MSGS, this.sgMsgSuccessHandler)
    chatSocket.addErrorHandler(REC_SG_MSGS, this.sgMsgErrorHandler)
  },
  addGpMsgListener() {
    chatSocket.addSuccessHandler(REC_GP_MSGS, this.sgMsgSuccessHandler)
    chatSocket.addErrorHandler(REC_GP_MSGS, this.sgMsgErrorHandler)
  },
  cmpTime(t1: string | number, t2: string | number) {
    return new Date(t1).getTime() < new Date(t2).getTime() - 180000 // 大于3分钟显示时间
  },
  handleViewMessageTime(target?: SgMsg[] | GpMsg[], start = 0, end?: number) {
    if (target === undefined) target = this.data.viewMessages
    if (end === undefined) end = target.length
    if (start < 0) start = 0
    if (end! <= start) return target.slice()
    const res = [target[start]]
    for (let i = start + 1; i < end!; i++) {
      const createdAt = target[i].createdAt!
      if (this.cmpTime(target[i - 1].createdAt!, createdAt)) {
        res.push({
          content: formatDetailDate(new Date(createdAt)),
          type: MsgType.system,
        })
      }
      res.push(target[i])
    }
    if (start === 0) {
      res.unshift({
        content: formatDetailDate(new Date(target[0].createdAt!)),
        type: MsgType.system,
      })
    }
    return res
  },
  scrollView(duration = 100) {
    wx.nextTick(() => wx.pageScrollTo({
      scrollTop: 999999,
      duration
    }))
  },
  audioPlay(e: WechatMiniprogram.CustomEvent) {
    const i = e.target.dataset.i
    const data = this.data.viewMessages[i]
    if (i === this.data._audioPlayIndex) { // 点击同一个
      if (this.data.audioPlayState === 0) {
        this.data._innerAudioContext.play()
        this.data.viewMessages[i].isPlay = true
      } else {
        this.data._innerAudioContext.pause()
        this.data.viewMessages[i].isPlay = false
      }
      this.setData({viewMessages: this.data.viewMessages})
      return
    }
    if (this.data.audioPlayState === 1) {
      this.data.viewMessages[this.data._audioPlayIndex].isPlay = false
    }
    this.data.viewMessages[i].isPlay = true
    const iac = this.data._innerAudioContext
    iac.src = BASE_URL + data.content
    iac.play()
    this.setData({_audioPlayIndex: i, viewMessages: this.data.viewMessages})
  },
  // 取消发送
  cancel() {
    this.setData({recordState: 0})
  },
  // 返回键盘输入
  retKeybroad() {
    this.setData({inputState: 0})
    this.cancel()
  },
  handleRecording() {
    if (this.data.recordState === 0) { // 未开始
      this.data.recordState = 1
      this.data._recorderManager.start({})
    } else if (this.data.recordState === 1) { // 录制中
      this.setData({recordState: 2}) // 录制结束
      this.data._recorderManager.stop()
    }
    this.setData({recordState: this.data.recordState})
  },
  async send() {
    // console.log(this.data.recordState, this.data.inputState)
    const type = this.data.recordState === 2 && this.data.inputState === 1 ? MsgType.audio : MsgType.text // 语音或文字
    const {target, chatType, title} = this.data
    const to = this.getTo()
    const username = userStore.user.username
    const fakeId = username + '-' + to + '-' + Date.now().toString(36)
    let data: string | number[]
    if (type === MsgType.audio) {
      const fsm = wx.getFileSystemManager()
      const arrayBuffer = fsm.readFileSync(this.data._recordFilePath) as ArrayBuffer
      data = Array.prototype.slice.call(new Uint8Array(arrayBuffer))
    } else {
      data = this.data.content
    }
    const message: SgMsg = {
      from: username,
      content: type === MsgType.audio ? '' : data, // 音频不保存在本地
      type,
      fakeId,
      state: MsgState.loading,
      createdAt: formatDate(),
      status: 0
    }
    const messageInfo = this.getMessageInfo(to)
    const viewMessages = this.data.viewMessages as SgMsg[]
    chatSocket.send({
      data: {
        to,
        content: data,
        fakeId,
        type,
        ext: type === MsgType.audio ? '.aac' : ''
      },
      action: SEND_SG_MSG
    }).then(() => {
      messageInfo.fakeIdIndexMap[fakeId] = messageInfo.messages.push(message as SgMsg) - 1
      const length = viewMessages.push(message)
      viewMessages.splice(length - 2, 2, ...this.handleViewMessageTime(undefined, length - 2) as SgMsg[])
      this.setData({viewMessages})
      // userStore.setUnameMessageInfoMap({ ...userStore.unameMessageInfoMap })
      this.scrollView()
    }, () => {
      message.state = MsgState.error
      messageInfo.fakeIdIndexMap[fakeId] = messageInfo.messages.push(message) - 1
      const length = viewMessages.push(message)
      viewMessages.splice(length - 2, 2, ...this.handleViewMessageTime(undefined, length - 2) as SgMsg[])
      this.setData({viewMessages})
      // userStore.setUnameMessageInfoMap({ ...userStore.unameMessageInfoMap })
      this.scrollView()
    })
    const map = chatType === ChatType.single ? app.globalData.toSaveUnameFakeIdsMap : app.globalData.toSaveGroupIdFakeIdsMap
    const fakeIds = map[to] || []
    fakeIds.push(fakeId)
    map[to] = fakeIds
    this.setData({content: '', _recordFilePath: '', recordState: 0})
    app.saveChats(message, {nickname: title, avatar: target.avatar!}, 0, chatType)
    app.saveMessages()
  },
  clearChat() {
    const to = this.getTo()
    const index = userStore.chats.findIndex(chat => chat.to === to)
    if (index > -1) {
      userStore.chats[index].newCount = 0
      userStore.setChats([...userStore.chats])
      wx.setStorageSync('chats-' + userStore.user.username, JSON.stringify(userStore.chats))
    }
  },
  getTo() {
    const {chatType, target} = this.data
    return chatType === ChatType.single ? (target as Contact).username : (target as GroupInfo).id
  },
  getMessageInfo(to: Users.Username | Groups.Id) {
    const {chatType} = this.data
    return ((chatType === ChatType.single ? userStore.unameMessageInfoMap[to] : userStore.groupIdMessageInfoMap[to]) || {}) as MessageInfo<SgMsg>
  },
  toChatInfo() {
    this.data.chatType === ChatType.group ? wx.navigateTo({url: GroupInfoPath + '?id=' + this.getTo()}) : wx.navigateTo({url: SingleInfoPath + '?username=' + this.getTo()})
  },
  clickMask() {
    this.setData({showHoverBtn: false, isActive: false, activeIndex: -1})
  },
  handleLongPress(e: LongPressEvent) {
    const {x, y} = e.detail
    const {windowHeight, windowWidth} = wx.getWindowInfo()
    let left = '', right = '', top = '', bottom = ''
    x < windowWidth - 100 ? left = x + 'px' : right = windowWidth - x + 'px'
    y < windowHeight - 250 ? top = y + 'px' : bottom = windowHeight - y + 'px'
    this.setData({showHoverBtn: true, left: left || 'unset', right: right || 'unset', top: top || 'unset', bottom: bottom || 'unset', isActive: true})
  },
  onTouchStart(e: WechatMiniprogram.CustomEvent) {
    this.setData({activeIndex: +e.currentTarget.dataset.i})
  },
  onTouchCancel() {
    if (this.data.isActive) return
    this.setData({activeIndex: -1})
  }
})
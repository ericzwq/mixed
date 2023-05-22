import {createStoreBindings} from 'mobx-miniprogram-bindings'
import {userStore} from '../../store/user'
import {LOAD_MESSAGE_COUNT, BASE_URL} from '../../consts/consts'
import {chatSocket} from '../../socket/socket'
import {formatDate, formatSimpleDate} from '../../common/utils'
import {REC_SG_MSGS, SEND_SG_MSG} from '../../socket/socket-actions'
import {UserDetailPath} from '../../consts/routes'

const app = getApp<IAppOption>()
Page({
  // options: {
  // pureDataPattern: /^_/
  // },
  data: {
    target: {} as Contact, // 目标用户
    content: '',
    keyboardUp: false,
    windowHeight: 0,
    type: '1', // 1单聊 2群聊
    STATIC_BASE_URL: BASE_URL,
    viewMessages: [] as SgMsg[],
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
  },
  storeBindings: {} as StoreBindings,
  onLoad(query: { username: string, type: ChatType }) {
    this.addMessageListener()
    const {username, type} = query
    this.storeBindings = createStoreBindings(this, {
      store: userStore,
      fields: ['user'],
    })
    const target = userStore.contactMap[username]
    if (!target) return
    this.setData({target, type})
    this.clearChat()
    wx.setNavigationBarTitle({title: target?.nickname})
    this.loadInitMessage()
  },

  containerTap(e: WechatMiniprogram.CustomEvent) {
    if (e.target.id !== 'showOpt' && !e.mark!['opts']) {
      this.setData({showOpts: false})
    }
    // setTimeout(() => e.target.focus(), 500) todo
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
  },
  onPullDownRefresh() {
    this.loadMoreMessage()
  },
  toDetail(e: WechatMiniprogram.CustomEvent) {
    wx.navigateTo({url: UserDetailPath + '?username=' + (e.target.dataset['right'] ? userStore.user.username : this.data.target.username)})
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
    const {username} = this.data.target
    const messageInfo = userStore.unameMessageInfoMap[username] || {}
    const index = wx.getStorageSync(username + '-i')
    messageInfo.maxMessagesIndex = +(index || 0)
    // console.log(messageInfo.messages, messageInfo.maxMessagesIndex, messageInfo.loadedMessagesMinIndex, messageInfo.loadedMessagesPageMinIndex)
    if (messageInfo.messages && messageInfo.messages.length >= LOAD_MESSAGE_COUNT) { // 如果全局有足够的消息数量则直接从内存中取
      const rest = messageInfo.messages.length - LOAD_MESSAGE_COUNT
      messageInfo.messages = messageInfo.messages.slice(messageInfo.messages.length - LOAD_MESSAGE_COUNT)
      this.data.viewMessages = this.handleViewMessageTime(messageInfo.messages)
      messageInfo.loadedMessagesMinIndex += Math.floor(rest / LOAD_MESSAGE_COUNT)
      messageInfo.loadedMessagesPageMinIndex += rest % LOAD_MESSAGE_COUNT
      console.log(messageInfo.maxMessagesIndex, messageInfo.loadedMessagesMinIndex, messageInfo.loadedMessagesPageMinIndex)
      // this.data.viewMessages = this.handleViewMessageTime(messageInfo.messages)
    } else { // 从缓存中读取
      if (index) { // 有本地消息
        messageInfo.loadedMessagesMinIndex = messageInfo.maxMessagesIndex
        const messages = JSON.parse(wx.getStorageSync(username + '-' + messageInfo.maxMessagesIndex))
        // console.log(messages.length, LOAD_MESSAGE_COUNT, messageInfo.maxMessagesIndex)
        if (messages.length < LOAD_MESSAGE_COUNT && messageInfo.maxMessagesIndex > 0) { // 消息不够loadMessageCount从上一页加载
          const lastMessages = JSON.parse(wx.getStorageSync(username + '-' + (--messageInfo.loadedMessagesMinIndex)))
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
    userStore.unameMessageInfoMap[username] = messageInfo
    this.data.viewMessages = this.handleViewMessageTime(messageInfo.messages)
    // console.log(this.data.viewMessages)
    this.setData({viewMessages: this.data.viewMessages})
    this.resetMessagesMap(messageInfo)
  },
  // 获取更多消息
  loadMoreMessage() {
    const {username} = this.data.target
    const messageInfo = userStore.unameMessageInfoMap[username]
    let preMessages
    if (messageInfo.loadedMessagesPageMinIndex >= LOAD_MESSAGE_COUNT) { // 本页数据够
      const messages = JSON.parse(wx.getStorageSync(username + '-' + (messageInfo.loadedMessagesMinIndex)))
      messageInfo.loadedMessagesPageMinIndex -= LOAD_MESSAGE_COUNT
      preMessages = messages.slice(messageInfo.loadedMessagesPageMinIndex, messageInfo.loadedMessagesPageMinIndex +
        LOAD_MESSAGE_COUNT)
      messageInfo.messages = preMessages.concat(messageInfo.messages)
    } else if (messageInfo.loadedMessagesMinIndex === 0) { // 到顶 todo 最后一项
      if (messageInfo.loadedMessagesPageMinIndex > 0) {
        const messages = JSON.parse(wx.getStorageSync(username + '-' + (messageInfo.loadedMessagesMinIndex)))
        preMessages = messages.slice(0, messageInfo.loadedMessagesPageMinIndex)
        messageInfo.messages = preMessages.concat(messageInfo.messages)
        messageInfo.loadedMessagesPageMinIndex = 0
      }
    } else { // 本页数据不够
      const messages = JSON.parse(wx.getStorageSync(username + '-' + messageInfo.loadedMessagesMinIndex))
      const lastMessages = JSON.parse(wx.getStorageSync(username + '-' + (--messageInfo.loadedMessagesMinIndex)))
      const _loadedMessagesPageMinIndex = messageInfo.loadedMessagesPageMinIndex
      messageInfo.loadedMessagesPageMinIndex = lastMessages.length - (LOAD_MESSAGE_COUNT - messageInfo.loadedMessagesPageMinIndex)
      preMessages = lastMessages.slice(messageInfo.loadedMessagesPageMinIndex).concat(messages.slice(0,
        _loadedMessagesPageMinIndex))
      messageInfo.messages = preMessages.concat(messageInfo.messages)
    }
    // console.log(this.loadedMessagesPageMinIndex, this.loadedMessagesIndex, this.messages.length)
    if (preMessages) {
      const preViewMessages = this.handleViewMessageTime(preMessages)
      const viewMessages = this.data.viewMessages
      if (viewMessages.length && !this.cmpTime(preViewMessages[preViewMessages.length - 1].createdAt!,
        viewMessages[0].createdAt!)) {
        viewMessages.shift() // 删除间隔时间
      }
      this.setData({viewMessages: preViewMessages.concat(viewMessages)})
    }
    this.resetMessagesMap(messageInfo)
    wx.stopPullDownRefresh()
  },
  resetMessagesMap(messageInfo: MessageInfo) {
    messageInfo.fakeIdIndexMap = {}
    messageInfo.messages.forEach((v, i) => messageInfo.fakeIdIndexMap[v.fakeId!] = i)
    // userStore.setUnameMessageInfoMap({ ...userStore.unameMessageInfoMap })
  },
  // 注册socket消息监听
  addMessageListener() {
    chatSocket.addSuccessHandler(REC_SG_MSGS, ((data: SocketResponse<SgMsg[]>) => {
      data.data.forEach((message: SgMsg) => {
        if (message.from === userStore.user.username) { // 自己发的
          const ownMessage = this.data.viewMessages.find(msg => msg.fakeId === message.fakeId)!
          delete ownMessage?.state
          ownMessage.createdAt = message.createdAt
        } else { // 别人发的
          const length = this.data.viewMessages.push(message)
          this.data.viewMessages.splice(length - 2, 2, ...this.handleViewMessageTime(undefined, length - 2))
        }
      })
      this.setData({viewMessages: this.data.viewMessages,})
      this.scrollView()
      app.saveMessages()
    }))
    chatSocket.addErrorHandler(REC_SG_MSGS, (data: SocketResponse<SgMsg>) => {
      const messageInfo = userStore.unameMessageInfoMap[data.data.to!]
      const message = messageInfo.messages[messageInfo.fakeIdIndexMap[data.data.fakeId!]]
      message.state = 'error'
      // userStore.setUnameMessageInfoMap({ ...userStore.unameMessageInfoMap })
      // this.setData({ viewMessages: this.data.viewMessages })
    })
  },
  cmpTime(t1: string | number, t2: string | number) {
    return new Date(t1).getTime() < new Date(t2).getTime() - 180000 // 大于3分钟显示时间
  },
  handleViewMessageTime(target?: SgMsg[], start = 0, end?: number) {
    if (target === undefined) target = this.data.viewMessages
    if (end === undefined) end = target.length
    if (start < 0) start = 0
    if (end! <= start) return target.slice()
    const res = [target[start]]
    for (let i = start + 1; i < end!; i++) {
      const createdAt = target[i].createdAt!
      if (this.cmpTime(target[i - 1].createdAt!, createdAt)) {
        res.push({
          content: formatSimpleDate(new Date(createdAt)),
          type: MsgType.system,
        })
      }
      res.push(target[i])
    }
    if (start === 0) {
      res.unshift({
        content: formatSimpleDate(new Date(target[0].createdAt!)),
        type: MsgType.system
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
    const target = this.data.target
    const username = userStore.user.username
    const fakeId = username + '-' + target.username + '-' + Date.now().toString(36)
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
      state: 'loading',
      createdAt: formatDate(),
      status: 0
    }
    const messageInfo = userStore.unameMessageInfoMap[target.username]
    chatSocket.send({
      data: {
        to: target.username,
        content: data,
        fakeId,
        type,
        ext: type === MsgType.audio ? '.aac' : ''
      },
      action: SEND_SG_MSG
    }).then(() => {
      messageInfo.fakeIdIndexMap[fakeId] = messageInfo.messages.push(message) - 1
      const length = this.data.viewMessages.push(message)
      this.data.viewMessages.splice(length - 2, 2, ...this.handleViewMessageTime(undefined, length - 2))
      this.setData({viewMessages: this.data.viewMessages})
      // userStore.setUnameMessageInfoMap({ ...userStore.unameMessageInfoMap })
      this.scrollView()
    }, () => {
      message.state = 'error'
      messageInfo.fakeIdIndexMap[fakeId] = messageInfo.messages.push(message) - 1
      const length = this.data.viewMessages.push(message)
      this.data.viewMessages.splice(length - 2, 2, ...this.handleViewMessageTime(undefined, length - 2))
      this.setData({viewMessages: this.data.viewMessages})
      // userStore.setUnameMessageInfoMap({ ...userStore.unameMessageInfoMap })
      this.scrollView()
    })
    const fakeIds = app.globalData.toSaveUnameFakeIdsMap[target.username] || []
    fakeIds.push(fakeId)
    app.globalData.toSaveUnameFakeIdsMap[target.username] = fakeIds
    this.setData({content: '', _recordFilePath: '', recordState: 0})
    app.saveChat(message, this.data.target, 0)
    app.saveMessages()
  },
  clearChat() {
    const index = userStore.chats.findIndex(chat => chat.username === this.data.target.username)
    if (index > -1) {
      userStore.chats[index].newCount = 0
      userStore.setChats([...userStore.chats])
      wx.setStorageSync('chats-' + userStore.user.username, JSON.stringify(userStore.chats))
    }
  },
})
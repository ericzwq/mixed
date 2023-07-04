import { createStoreBindings } from 'mobx-miniprogram-bindings'
import { userStore } from '../../store/user'
import { BASE_URL, LOAD_MESSAGE_COUNT, primaryColor, SAVE_MESSAGE_LENGTH } from '../../consts/consts'
import { chatSocket } from '../../socket/socket'
import { formatDate, formatDetailDate } from '../../common/utils'
import { READ_GP_MSGS, READ_SG_MSGS, REC_GP_MSGS, REC_SG_MSGS, SEND_GP_MSG, SEND_SG_MSG } from '../../socket/socket-actions'
import { ChooseFriendPath, GroupInfoPath, SingleInfoPath, UserDetailPath } from '../../consts/routes'
import { ChatType, MsgState, MsgStatus, MsgType, MsgRead } from '../../socket/socket-types'
// @ts-ignore
import Dialog from "@vant/weapp/dialog/dialog";
import { ChooseMode } from "../choose-friend/choose-friend-types";
import { stagingStore } from "../../store/staging";
import { TransmitType } from "./chat-detail-types";
import storage from "../../common/storage";

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
    BASE_URL,
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
    activeIndex: -1,
    isActive: false,
    primaryColor,
    showSelects: false,
    selecteds: [] as SgMsg[] | GpMsg[],
    fakeIdSelectedMap: {} as { [key in string]: boolean },
    floatMenu: {} as FloatMenu,
    showActions: false,
    actions: [
      { name: '逐条转发', type: TransmitType.single },
      { name: '合并转发', type: TransmitType.union }
    ],
    replyTarget: null as SgMsg | GpMsg | null, // 回复的对象
    maxReadCount: 1,
  },
  storeBindings: {} as StoreBindings,
  containerTap(e: WechatMiniprogram.CustomEvent) {
    if (e.target.id !== 'showOpt' && !e.mark!['opts']) {
      this.setData({ showOpts: false })
    }
    // setTimeout(() => e.target.focus(), 500) todo
  },
  toDetail(e: WechatMiniprogram.CustomEvent) {
    wx.navigateTo({ url: UserDetailPath + '?username=' + this.data.viewMessages[e.currentTarget.dataset.i].from })
  },
  onLoad(query: { to: string, type: ChatType }) {
    this.addSgMsgListener()
    this.addGpMsgListener()
    const { to, type } = query
    this.storeBindings = createStoreBindings(this, {
      store: userStore,
      fields: ['user', 'unameUserMap'],
    })
    let target: Contact | GroupInfo, title: string, plus = '', maxReadCount = 1
    new Promise<void>(resolve => {
      if (type === ChatType.single) {
        target = { ...userStore.contactMap[to], ...userStore.unameUserMap[to], username: to }
        if (!target) return
        title = target.remark
        resolve()
      } else {
        userStore.getGroupIdGroupInfo(+to).then(groupInfo => {
          target = groupInfo
          title = groupInfo.name
          maxReadCount = groupInfo.count
          plus = '（' + maxReadCount + '）'
          resolve()
        })
      }
    }).then(() => {
      this.setData({ target, chatType: type, title: title + plus, maxReadCount })
      this.clearChat()
      wx.setNavigationBarTitle({ title })
      const messageInfo = app.getMessageInfo(to, type)
      messageInfo.showedMsgsMinIndex = messageInfo.messages.length
      this.loadMsgs()
      this.readMsgs(messageInfo)
    })
  },
  onReady() {
    const iac = wx.createInnerAudioContext()
    iac.onEnded(() => {
      this.data.viewMessages[this.data._audioPlayIndex].isPlay = false
      this.setData({ audioPlayState: 0, viewMessages: this.data.viewMessages })
    })
    iac.onPause(() => {
      this.setData({ audioPlayState: 0 })
    })
    iac.onPlay(() => {
      this.setData({ audioPlayState: 1 })
    })
    iac.onError((res) => {
      console.log('音频播放异常', res)
      this.data.viewMessages[this.data._audioPlayIndex].isPlay = false
      wx.showToast({ title: '音频播放异常' })
      this.setData({ audioPlayState: 0, viewMessages: this.data.viewMessages })
    })
    this.data._recorderManager.onStop(listener => this.setData({ _recordFilePath: listener.tempFilePath }))
    this.data._recorderManager.onError(e => {
      console.log('音频录制异常', e)
      wx.showToast({ title: e.errMsg })
    })
    this.data.floatMenu = this.selectComponent('.float-menu') as FloatMenu
    this.setData({ _innerAudioContext: iac, windowHeight: wx.getWindowInfo().windowHeight })
    wx.onWindowResize(e => {
      this.setData({ keyboardUp: this.data.windowHeight > e.size.windowHeight, windowHeight: e.size.windowHeight })
      setTimeout(() => this.scrollView(0))
    })
    this.scrollView(0)
  },
  onUnload() {
    this.storeBindings.destroyStoreBindings()
    chatSocket.removeSuccessHandler(REC_SG_MSGS, this.sgMsgSuccessHandler)
    chatSocket.removeErrorHandler(REC_SG_MSGS, this.sgMsgErrorHandler)
    const messageInfo = app.getMessageInfo(this.getTo(), this.data.chatType)
    messageInfo.showedMsgsMinIndex = messageInfo.messages.length
  },
  handleTimeoutMsgs() {

  },
  readMsgs(messageInfo: MessageInfo<SgMsg | GpMsg>) {
    const ids: SgMsgs.Id[] = []
    const to = this.getTo()
    const { chatType } = this.data
    const isSingle = chatType === ChatType.single
    messageInfo.messages.forEach(msg => {
      if ((isSingle && msg.read === MsgRead.no) || (!isSingle && !msg.read)) {
        ids.push(msg.id!)
      }
    })
    ids.length && chatSocket.send({ action: isSingle ? READ_SG_MSGS : READ_GP_MSGS, data: { ids, to } })
  },
  onPullDownRefresh() {
    this.loadMsgs()
    wx.stopPullDownRefresh()
  },
  toUserDetail(e: WechatMiniprogram.CustomEvent) {
    const { right, i } = e.currentTarget.dataset
    const { target, chatType, viewMessages } = this.data
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
    wx.navigateTo({ url: UserDetailPath + '?username=' + username })
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
    this.setData({ callState: 0 })
  },
  handleMic() {
    this.setData({ inputState: 1 })
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
    this.setData({ showOpts: !this.data.showOpts })
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
  // 获取消息
  loadMsgs() {
    const { chatType, viewMessages } = this.data
    const { username } = userStore.user
    const to = this.getTo()
    const prefixKey = username + '-' + chatType + '-' + to + '-'
    const messageInfo = app.getMessageInfo(to, chatType)
    const msgsLen = messageInfo.messages.length
    let { messages, validMsgCount } = this.getValidMsgFromMemory(messageInfo)
    const storageMsgs = this.getValidMsgFromStorage(messageInfo, LOAD_MESSAGE_COUNT - validMsgCount, prefixKey)
    messages = storageMsgs.concat(messages)
    messageInfo.showedMsgsMinIndex += messageInfo.messages.length - msgsLen - messages.length
    this.data.viewMessages = this.handleViewMessageTime(messages).concat(viewMessages) as typeof viewMessages
    this.setData({ viewMessages: this.data.viewMessages })
  },
  getValidMsgFromMemory<T extends SgMsg | GpMsg>(messageInfo: MessageInfo<T>) {
    const msgs = []
    let validMsgCount = 0
    let i = messageInfo.showedMsgsMinIndex - 1
    for (; i > -1 && validMsgCount < LOAD_MESSAGE_COUNT; i--) {
      msgs.push(messageInfo.messages[i])
      messageInfo.messages[i].state !== MsgState.delete && validMsgCount++
    }
    console.log('从内存中获取', { messages: [...msgs].reverse(), validMsgCount })
    return { messages: msgs.reverse(), validMsgCount }
  },
  getValidMsgFromStorage<T extends SgMsg | GpMsg>(messageInfo: MessageInfo<T>, count: number, prefixKey: string) {
    const msgs = []
    let validMsgCount = 0
    const { chatType } = this.data
    const untreatedRetractMsgInfoSet = storage.getUntreatedRetractMsgInfoSet()
    const untreatedReadMsgInfoSet = storage.getUntreatedReadMsgInfoSet()
    while (validMsgCount < count && messageInfo.loadedMsgsMinIndex > 0) {
      const lastMessages: T[] = JSON.parse(wx.getStorageSync(prefixKey + (--messageInfo.loadedMsgsMinIndex)))
      messageInfo.messages = lastMessages.concat(messageInfo.messages)
      let i = lastMessages.length - 1
      for (; i > -1 && validMsgCount < count; i--) {
        msgs.push(lastMessages[i])
        lastMessages[i].state !== MsgState.delete && validMsgCount++
        const key = lastMessages[i].id + '-' + chatType
        if (untreatedRetractMsgInfoSet.delete(key)) { // 处理撤回的消息
          lastMessages[i].status = MsgStatus.retract
        }
        if (untreatedReadMsgInfoSet.delete(key)) { // 处理已读的消息
          chatType === ChatType.single ? lastMessages[i].read = MsgRead.yes : (lastMessages as GpMsg[])[i].readCount!++
        }
      }
    }
    storage.setUntreatedRetractMsgInfoSet(untreatedRetractMsgInfoSet)
    storage.setUntreatedReadMsgInfoSet(untreatedReadMsgInfoSet)
    this.resetMessagesMap(messageInfo)
    console.log('从缓存中获取', { messages: [...msgs].reverse(), validMsgCount })
    return msgs.reverse()
  },
  resetMessagesMap<T extends SgMsg | GpMsg>(messageInfo: MessageInfo<T>) {
    messageInfo.fakeIdIndexMap = {}
    messageInfo.messages.forEach((v, i) => messageInfo.fakeIdIndexMap[v.fakeId!] = i)
  },
  sgMsgSuccessHandler: (_data: SocketResponse) => {
  },
  sgMsgErrorHandler: (_data: SocketResponse) => {
  },
  // 注册单聊消息监听
  addSgMsgListener() {
    this.sgMsgSuccessHandler = ((data: SocketResponse<SgMsg[]>) => {
      const viewMessages = this.data.viewMessages as SgMsg[]
      // const {chatType} = this.data
      const { user: { username } } = userStore
      const msg = data.data[0]
      if (!msg) return
      // const to = chatType === ChatType.single ? msg.to === username ? msg.from! : msg.to! : msg.to!
      // const {messages} = app.getMessageInfo(to, chatType)
      data.data.forEach((message: SgMsg) => {
        let flag = false
        if (message.from === username) { // 自己发的
          let ownMessage = viewMessages.find(msg => msg.fakeId === message.fakeId) as SgMsg | GpMsg
          if (!ownMessage) {
            // ownMessage = messages.find(msg => msg.fakeId === message.fakeId) as SgMsg | GpMsg
            flag = true
            // if (ownMessage) {
            // delete ownMessage.state
            // ownMessage.createdAt = message.createdAt
            // }
          }
        } else {
          flag = true
        }
        if (flag) {
          const length = viewMessages.push(message as SgMsg)
          viewMessages.splice(length - 2, 2, ...this.handleViewMessageTime(undefined, length - 2) as SgMsg[])
        }
      })
      this.setData({ viewMessages: [...viewMessages] })
      this.scrollView()
      app.saveMessages()
    })
    this.sgMsgErrorHandler = (data: SocketResponse<SgMsg>) => {
      const messageInfo = userStore.unameMessageInfoMap[data.data.to!]
      const message = messageInfo.messages[messageInfo.fakeIdIndexMap[data.data.fakeId!]]
      message.state = MsgState.error
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
  getTimeMsg(createdAt: SgMsgs.CreatedAt) {
    return {
      content: formatDetailDate(new Date(createdAt)),
      type: MsgType.system,
    }
  },
  handleViewMessageTime<T extends SgMsg | GpMsg>(target?: T[], start = 0, end?: number) {
    if (target === undefined) target = this.data.viewMessages as T[]
    if (end === undefined) end = target.length
    if (start < 0) start = 0
    const _start = start
    if (end <= start) return target.slice()
    const res = []
    for (; start < end && target[start].state === MsgState.delete; start++) {
      res.push(target[start])
    }
    if (start < end) { // 有要展示的消息
      if (_start === 0) {
        res.push(this.getTimeMsg(target[start].createdAt!) as T)
      } else { // 跟上一条比对
        let i = _start - 1
        while (i > -1 && target[i].state === MsgState.delete) i--
        if (i > -1 && this.cmpTime(target[i].createdAt!, target[start].createdAt!)) {
          console.log('拼接上一条的时间差', target, _start, start, i)
          res.push(this.getTimeMsg(target[start].createdAt!) as T)
        }
      }
      res.push(target[start])
    }
    let last = target[start]
    for (let i = start + 1; i < end; i++) {
      if (target[i].state !== MsgState.delete) {
        if (this.cmpTime(last.createdAt!, target[i].createdAt!)) {
          res.push(this.getTimeMsg(target[i].createdAt!) as T)
        }
        last = target[i]
      }
      res.push(target[i])
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
    const i = e.currentTarget.dataset.i
    const data = this.data.viewMessages[i]
    if (i === this.data._audioPlayIndex) { // 点击同一个
      if (this.data.audioPlayState === 0) {
        this.data._innerAudioContext.play()
        this.data.viewMessages[i].isPlay = true
      } else {
        this.data._innerAudioContext.pause()
        this.data.viewMessages[i].isPlay = false
      }
      this.setData({ viewMessages: this.data.viewMessages })
      return
    }
    if (this.data.audioPlayState === 1) {
      this.data.viewMessages[this.data._audioPlayIndex].isPlay = false
    }
    this.data.viewMessages[i].isPlay = true
    const iac = this.data._innerAudioContext
    iac.src = BASE_URL + data.content
    iac.play()
    this.setData({ _audioPlayIndex: i, viewMessages: this.data.viewMessages })
  },
  // 取消发送
  cancel() {
    this.setData({ recordState: 0 })
  },
  // 返回键盘输入
  retKeybroad() {
    this.setData({ inputState: 0 })
    this.cancel()
  },
  handleRecording() {
    if (this.data.recordState === 0) { // 未开始
      this.data.recordState = 1
      this.data._recorderManager.start({})
    } else if (this.data.recordState === 1) { // 录制中
      this.setData({ recordState: 2 }) // 录制结束
      this.data._recorderManager.stop()
    }
    this.setData({ recordState: this.data.recordState })
  },
  send() {
    const type = this.data.recordState === 2 && this.data.inputState === 1 ? MsgType.audio : MsgType.text // 语音或文字
    const status = this.data.replyTarget ? MsgStatus.reply : MsgStatus.normal
    let content: string | number[]
    if (type === MsgType.audio) {
      const fsm = wx.getFileSystemManager()
      const arrayBuffer = fsm.readFileSync(this.data._recordFilePath) as ArrayBuffer
      content = Array.prototype.slice.call(new Uint8Array(arrayBuffer))
    } else {
      content = this.data.content
    }
    this.handleSend(type, status, content)
  },
  async handleSend(type: MsgType, status: MsgStatus, content: MsgContent) {
    const { target, chatType, title, replyTarget } = this.data
    const isSingle = chatType === ChatType.single
    const to = this.getTo()
    const username = userStore.user.username
    const fakeId = username + '-' + to + '-' + Date.now().toString(36)
    const saveData = type === MsgType.audio ? '' : content // 音频不保存在本地
    const message = {
      from: username,
      content: replyTarget ? { id: replyTarget.id, data: saveData } as ReplyContent : saveData,
      type,
      fakeId,
      state: MsgState.loading,
      createdAt: formatDate(),
      status
    }
    const messageInfo = app.getMessageInfo(to, this.data.chatType)
    const { messages } = messageInfo
    const viewMessages = this.data.viewMessages
    let validIndex = messages.length - 1
    for (; validIndex > -1; validIndex--) {
      if (!messages[validIndex].state) break
    }
    chatSocket.send({
      data: {
        to,
        content: replyTarget ? { id: replyTarget.id, data: content } as ReplyContent : content,
        fakeId,
        type,
        status: message.status,
        ext: type === MsgType.audio ? '.aac' : '',
        lastId: validIndex > -1 ? messages[validIndex].id! : null
      },
      action: isSingle ? SEND_SG_MSG : SEND_GP_MSG
    }).catch(() => message.state = MsgState.error)
      .finally(() => {
        const length = viewMessages.push(message)
        messageInfo.fakeIdIndexMap[fakeId] = messageInfo.messages.push(message) - 1
        viewMessages.splice(length - 2, 2, ...this.handleViewMessageTime(undefined, length - 2) as SgMsg[])
        messageInfo.maxMsgsIndex = messageInfo.loadedMsgsMinIndex + Math.floor((messageInfo.messages.length - 1) / SAVE_MESSAGE_LENGTH)
        this.setData({ viewMessages })
        this.scrollView()
      })
    app.setToSaveFakeIds(to, [fakeId], isSingle)
    this.setData({ content: '', _recordFilePath: '', recordState: 0 })
    app.saveChats({ ...message, to: to as unknown as number }, { nickname: title, avatar: target.avatar! }, 0, chatType)
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
    const { chatType, target } = this.data
    return chatType === ChatType.single ? (target as Contact).username : (target as GroupInfo).id
  },
  toChatInfo() {
    this.data.chatType === ChatType.group ? wx.navigateTo({ url: GroupInfoPath + '?id=' + this.getTo() }) : wx.navigateTo({ url: SingleInfoPath + '?username=' + this.getTo() })
  },
  onClose() {
    this.setData({ isActive: false, activeIndex: -1 })
  },
  handleLongPress(e: LongPressEvent) {
    const { clientX, clientY } = e.touches[0]
    this.selectComponent('.float-menu').open(clientX, clientY)
    this.setData({ isActive: true })
    this.toggle({ currentTarget: { dataset: { i: this.data.activeIndex } } })
  },
  onTouchStart(e: WechatMiniprogram.CustomEvent) {
    if (this.data.showSelects) return
    this.setData({ activeIndex: +e.currentTarget.dataset.i })
  },
  onTouchCancel() {
    if (this.data.isActive) return
    this.setData({ activeIndex: -1 })
  },
  copy() {
    wx.setClipboardData({
      data: this.data.viewMessages[this.data.activeIndex].content as string,
      success() {
        wx.showToast({ title: '复制成功' })
      },
      fail() {
        wx.showToast({ title: '复制失败', icon: 'error' })
      }
    })
    this.setData({ activeIndex: -1 })
    this.data.floatMenu.close()
  },
  transmit() {
    const { showSelects, chatType, selecteds, floatMenu, viewMessages, activeIndex } = this.data
    if (showSelects && !selecteds.length) {
      wx.showToast({ title: '请至少选择一条消息', icon: 'error' })
      return
    }
    const { chatLog } = stagingStore
    chatLog.chatType = chatType
    if (showSelects) {
      chatLog.isMul = true
      chatLog.data = selecteds
      const memberSet = new Set<Users.Username>()
      selecteds.some((selected: SgMsg | GpMsg) => memberSet.add(selected.from!).size === 2)
      chatLog.members = Array.from(memberSet)
      chatLog.computeChatLogTitle(chatLog.members, chatType).then(r => chatLog.title = r)
      this.setData({ showActions: true })
    } else {
      chatLog.type = TransmitType.single
      chatLog.isMul = false
      chatLog.data = [viewMessages[activeIndex]] as SgMsg[] | GpMsg[]
      wx.navigateTo({ url: ChooseFriendPath + '?mode=' + ChooseMode.chats })
    }
    this.setData({ activeIndex: -1 })
    floatMenu.close()
  },
  collect() {
    wx.showToast({ title: '敬请期待！' })
    this.setData({ activeIndex: -1 })
    this.data.floatMenu.close()
  },
  multipleChoice() {
    this.setData({ showSelects: true, activeIndex: -1 })
    this.data.floatMenu.close()
  },
  onTap(e: WechatMiniprogram.CustomEvent) {
    const mark = e.mark
    if (!mark) return
    if (mark['toggle'] || this.data.showSelects) return this.toggle(e)
    if (mark['audioPlay']) return this.audioPlay(e)
    if (mark['toUserDetail']) return this.toUserDetail(e)
  },
  toggle(e: { currentTarget: { dataset: { i?: string | number } } }) {
    const { i } = e.currentTarget.dataset
    const checkbox = this.selectComponent('.box-' + i)
    const { value } = checkbox.data
    checkbox.setData({ value: !value })
    const { viewMessages, fakeIdSelectedMap, selecteds } = this.data
    const message = viewMessages[i as number] as SgMsg
    if (!value) {
      if (selecteds.length >= 100) {
        wx.showToast({ title: '最多选100个', icon: 'error' })
        return
      }
      selecteds.push(message as SgMsg & GpMsg)
      fakeIdSelectedMap[message.fakeId!] = true
    } else {
      selecteds.splice(selecteds.findIndex((m: SgMsg | GpMsg) => m.fakeId === message.fakeId), 1)
      delete fakeIdSelectedMap[message.fakeId!]
    }
    console.log({ selecteds })
  },
  retract() {
    Dialog.confirm({ message: '确定撤回该消息吗？' }).then(() => {
      this.handleSend(MsgType.system, MsgStatus.retract, this.data.viewMessages[this.data.activeIndex].id!)
    })
    this.setData({ activeIndex: -1 })
    this.data.floatMenu.close()
  },
  reply() {
    this.setData({ replyTarget: this.data.viewMessages[this.data.activeIndex], activeIndex: -1 })
    this.data.floatMenu.close()
  },
  cancelReply() {
    this.setData({ replyTarget: null })
  },
  delete() {
    const { viewMessages, activeIndex, chatType, showSelects, selecteds } = this.data
    this.data.floatMenu.close()
    if (showSelects && !selecteds.length) {
      wx.showToast({ title: '请至少选择一条消息', icon: 'error' })
      return
    }
    Dialog.confirm({ message: '确认删除该消息吗？' }).then(() => {
      let fakeIds: SgMsgs.FakeId[] = []
      let indexes: number[] = []
      if (showSelects) {
        const fakeIdIndexMap = {} as { [key in string]: number }
        viewMessages.forEach((msg: SgMsg | GpMsg, i: number) => fakeIdIndexMap[msg.fakeId!] = i)
        selecteds.forEach((msg: SgMsg | GpMsg) => {
          fakeIds.push(msg.fakeId!)
          const index = fakeIdIndexMap[msg.fakeId!]
          indexes.push(index)
          viewMessages[index].state = MsgState.delete
        })
      } else {
        const message = viewMessages[activeIndex]
        message.state = MsgState.delete
        fakeIds = [message.fakeId!]
        indexes = [activeIndex]
      }
      app.setToSaveFakeIds(this.getTo(), fakeIds, chatType === ChatType.single)
      this.handleDelSysTimeMsg(viewMessages, indexes)
      app.saveMessages()
      this.setData({ activeIndex: -1, viewMessages, showSelects: false })
    }).catch(() => this.setData({ activeIndex: -1, showSelects: false })).finally(() => this.setData({ selecteds: [], fakeIdSelectedMap: {} }))
  },
  handleDelSysTimeMsg(viewMessages: SgMsg[] | GpMsg[], indexes: number[]) {
    indexes.forEach(index => {
      if (!viewMessages[index - 1].createdAt) { // 上一条为系统的时间消息
        if (viewMessages[index + 1].createdAt) { // 下一条为系统的时间消息
          viewMessages.splice(index - 1, 1)
        } else {
          let nextMsg, lastMsg, newMsg
          for (let i = index + 1; i < viewMessages.length; i++) {
            if (viewMessages[i].state !== MsgState.delete) {
              nextMsg = viewMessages[i]
              break
            }
          }
          for (let i = index - 2; i > -1; i--) {
            if (viewMessages[i].state !== MsgState.delete) {
              lastMsg = viewMessages[i]
              break
            }
          }
          if (nextMsg && ((lastMsg && this.cmpTime(lastMsg.createdAt!, nextMsg.createdAt!)) || !lastMsg)) { // 最后一条消息
            newMsg = this.getTimeMsg(nextMsg.createdAt!)
          }
          newMsg ? viewMessages.splice(index - 1, 1, newMsg) : viewMessages.splice(index - 1, 1)
        }
      }
    })
  },
  closeMulSelOpt() {
    this.setData({ showSelects: false, selecteds: [], fakeIdSelectedMap: {} })
  },
  onCloseActions() {
    this.setData({ showActions: false })
  },
  onSelectAction(e: WechatMiniprogram.CustomEvent<{ type: TransmitType }>) {
    stagingStore.chatLog.type = e.detail.type
    wx.navigateTo({ url: ChooseFriendPath + '?mode=' + ChooseMode.chats })
  },
})
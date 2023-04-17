interface ChatOption {
  target: Contact
  content: string,
  keyboardUp: boolean,
  windowHeight: number,
  type: ChatType,
  STATIC_BASE_URL: string,
  messagesMap: FakeIdIndexMap,
  messages: Message[],
  viewMessages: Message[],
  loadMessageCount: number, // 默认加载消息数
  maxMessagesIndex: number, // messages最大本地缓存分页索引
  loadedMessagesIndex: number, // messages已加载本地缓存分页索引
  loadedMessagesPageMinIndex: number, // 本地缓存中已加载的分页最小索引
  saveIds: string[], // 需要缓存的id列表
  saveTime: number,
  saveStatus: string,
  inputState: ChatInputState,
  recordState: ChatRecordState,
  recorderManager: WechatMiniprogram.RecorderManager,
  recordFilePath: string,
  innerAudioContext: WechatMiniprogram.InnerAudioContext,
  audioPlayIndex: number, // 音频播放的索引
  showOpts: boolean,
  voiceTarget: null,
  offer: null,
  rtc1: null,
  rtc2: null,
  isMuted: boolean,
  noMicoff: boolean,
  noVideo: boolean,
  localStream: null,
  remoteStream: null,
  callState: ChatCallState,
  audioSender: [],
  videoSender: [],
}

interface FakeIdIndexMap {
  [key: string]: number
}

type ChatType = '1' | '2'  // 1单聊 2群聊
type ChatInputState = 0 | 1 // 0键盘 1语音
type ChatRecordState = 0 | 1 | 2 // 0未开始(无数据) 1录制中 2录制完
type ChatCallState = 0 | 1 | 2 // 0 无 1主动方 2接收方
type ChatAudioPlayState = 0 | 1

declare namespace Messages {
  export type Data = string | number[]
  export type Type = number // 数据类型 0系统消息 1文本 3音频
  export type FakeId = string
  export type State = string
  export type CreatedAt = string
  export type Status = number
  export type Message = string // 别人发的
  export type isPlay = boolean
}

interface Message {
  from?: Users.Username
  to?: Users.Username
  data: Messages.Data // 音频不保存在本地
  type: Messages.Type
  fakeId?: Messages.FakeId
  state?: Messages.State
  createdAt?: Messages.CreatedAt
  status?: Messages.Status
  isPlay?: Messages.isPlay
}
declare namespace SgMsgs {
  type Id = number
  type Content = string | number[] | number | ChatLog
  type From = Users.Username
  type To = Users.Username
  type FakeId = string // 前端消息id
  type CreatedAt = string
  type Ext = string
  type Next = Id | null
  type Pre = Id | null
}

interface GetHisSgMsgReq {
  count: number | null
  maxId: SgMsgs.Id
  minId: SgMsgs.Id | null
}

interface SendSgMsgReq {
  type: MsgType
  content: SgMsgs.Content
  fakeId: SgMsgs.FakeId
  ext?: SgMsgs.Ext
  lastId: SgMsgs.Id | null
  to: SgMsgs.To
}

interface TransmitSgMsgsReq {
  to: Users.Username
  lastId: SgMsgs.Id | null
  msgs: Omit<SendSgMsgReq, 'to' | 'lastId'>[]
}

interface SgMsgRes {
  id: SgMsgs.Id
  type: MsgType // 1普通消息 2系统消息 3撤回消息
  fakeId: SgMsgs.FakeId // 前端消息id
  from: SgMsgs.From
  to: SgMsgs.To
  createdAt?: SgMsgs.CreatedAt
  content: SgMsgs.Content
  status: MsgStatus
  next: SgMsgs.Next
  pre: SgMsgs.Pre
  read: MsgRead
}

interface ReadSgMsgReq {
  ids: SgMsgs.Id[]
  to: SgMsgs.To
}

interface FakeIdIndexMap {
  [key: string]: number
}

declare enum ChatType { single = '1', group = '2'}

type ChatInputState = 0 | 1 // 0键盘 1语音
type ChatRecordState = 0 | 1 | 2 // 0未开始(无数据) 1录制中 2录制完
type ChatCallState = 0 | 1 | 2 // 0 无 1主动方 2接收方
type ChatAudioPlayState = 0 | 1

interface SgMsg extends Partial<SgMsgRes> {
  content: SgMsgs.Content
  type: MsgType
  state?: MsgState
  isPlay?: boolean
}

interface MessageInfo<T extends SgMsg | GpMsg> {
  fakeIdIndexMap: FakeIdIndexMap,
  messages: T[],
  maxMsgsIndex: number, // messages最大本地缓存分页索引，默认0
  loadedMsgsMinIndex: number, // messages已加载本地缓存的最小分页索引，默认0
  showedMsgsMinIndex: number // 已展示的messages最小索引, 默认为messages长度（初始未展示）
}

interface UnameMessageInfoMap {
  [key: string]: MessageInfo<SgMsg>
}
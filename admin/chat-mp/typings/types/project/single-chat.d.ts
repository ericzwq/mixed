declare namespace SgMsgs {
  type Id = number
  type Content = string | number[] | number
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

interface SgMsgReq {
  type: MsgType
  content: SgMsgs.Content
  fakeId: SgMsgs.FakeId
  ext?: SgMsgs.Ext
  lastId?: SgMsgs.Id
  to: SgMsgs.To
  pre: SgMsgs.Pre // 额外的
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
  state?: 'loading' | 'error'
  isPlay?: boolean
}

declare namespace ChatItems {
  export type NewCount = number
}

interface ChatItem {
  content: SgMsgs.Content
  nickname: Users.Nickname
  createdAt: SgMsgs.CreatedAt
  avatar: Users.Avatar
  newCount: ChatItems.NewCount // 新消息数量
  type: MsgType
  from: Users.Username
  to: Users.Username | GpMsgs.Id
  chatType: ChatType
}

interface MessageInfo<T> {
  fakeIdIndexMap: FakeIdIndexMap,
  messages: T[],
  maxMessagesIndex: number, // messages最大本地缓存分页索引，默认0
  loadedMessagesMinIndex: number, // messages已加载本地缓存分页最小索引，默认-1
  loadedMessagesPageMinIndex: number, // 本地缓存中已加载的分页最小索引，默认Infinity
}

interface UnameMessageInfoMap {
  [key: string]: MessageInfo<SgMsg>
}
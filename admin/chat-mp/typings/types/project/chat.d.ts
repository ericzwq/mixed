declare namespace ChatItems {
  export type NewCount = number
  export type IsTop = boolean
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
  state?: MsgState
  isTop: ChatItems.IsTop // 是否置顶
}

declare enum MsgState {
  loading = 1,
  error = 2,
  delete = 3
}

declare enum SysMsgContType {
  text = 1, // 普通文本
  username = 2 // 用户名
}

// 动态系统消息类型
interface SysMsgCont {
  type: SysMsgContType
  value: Users.Username
}

// 转发类型
declare enum TransmitType {
  single = 1, // 单独
  union = 2, // 合并
}

interface ChatLog {
  chatType: ChatType
  ids: SgMsgs.Id[]
}

interface GetMsgsByIdsRes {
  fakeId: string
  data: SgMsg[] | GpMsg[]
}

interface ReadSgMsgsRes {
  ids: SgMsgs.Id[]
  from: SgMsgs.From
  to: SgMsgs.To
}

interface ReadGpMsgsRes {
  ids: GpMsgs.Id[]
  from: GpMsgs.From
  to: GpMsgs.To
}
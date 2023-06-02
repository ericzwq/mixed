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
  loading = 'loading',
  error = 'error'
}

declare enum SysMsgContType {
  text = 1, // 普通文本
  username = 2 // 用户名
}

interface SysMsgCont {
  type: SysMsgContType
  value: Users.Username
}
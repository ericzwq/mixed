declare namespace Users {
  export type Username = string
  export type Password = string
  export type Nickname = string
  export type Avatar = string
  export type Email = string
  export type Code = string
}

interface User {
  username: Users.Username, nickname: Users.Nickname, avatar: Users.Avatar, email: Users.Email
}

declare namespace ChatItems {
  export type NewCount = number
}

interface ChatItem {
  username: Users.Username
  message: SgMsgs.Data
  nickname: Users.Nickname
  createdAt: SgMsgs.CreatedAt
  avatar: Users.Avatar
  newCount: ChatItems.NewCount // 新消息数量
  type: SgMsgs.Type
  from: Users.Username
}

interface MessageInfo {
  fakeIdIndexMap: FakeIdIndexMap,
  messages: SgMsg[],
  maxMessagesIndex: number, // messages最大本地缓存分页索引，默认0
  loadedMessagesMinIndex: number, // messages已加载本地缓存分页最小索引，默认-1
  loadedMessagesPageMinIndex: number, // 本地缓存中已加载的分页最小索引，默认Infinity
}

interface UnameMessageInfoMap {
  [key: string]: MessageInfo
}
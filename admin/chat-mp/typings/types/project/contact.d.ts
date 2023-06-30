declare namespace Contacts {
  export type Id = number
  export type Master = Users.Username
  export type Sub = Users.Username

  export enum Status {
    normal = 0, // 正常
    delete = 1, // 已删除
    blackList = 2, // 黑名单
    delAndBlack = 3 // 删除并拉黑
  }

  export type Remark = string
}

interface Contact {
  username: Users.Username,
  nickname?: Users.Nickname, // 只在从后端获取时存在
  avatar?: Users.Avatar, // 只在从后端获取时存在
  email?: Users.Email // 只在从后端获取时存在
  status: Contacts.Status,
  remark: Contacts.Remark
}

interface ContactMap {
  [key: string]: Contact
}

declare namespace FriendApls {
  export type Reason = string
  export type Id = number
  export type Remark = string
  export type UpdatedAt = string

  export enum Status {
    pending = 0, // 待确认
    accept = 1, // 同意
    reject = 2 // 拒绝
  }
}

interface FriendApl {
  id: FriendApls.Id
  contactId: Contacts.Id
  from: Users.Username
  reason: FriendApls.Reason
  nickname: Users.Nickname
  avatar: Users.Avatar
  status: FriendApls.Status
  updatedAt: FriendApls.UpdatedAt
}
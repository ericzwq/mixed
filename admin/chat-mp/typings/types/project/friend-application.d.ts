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

declare interface FriendApl {
  friendAplId: FriendApls.Id
  contactId: Contacts.Id
  from: Users.Username
  reason: FriendApls.Reason
  nickname: Users.Nickname
  avatar: Users.Avatar
  status: FriendApls.Status
  updatedAt: FriendApls.UpdatedAt
}
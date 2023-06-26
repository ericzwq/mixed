import {Users} from '../../../router/user/user-types'
import {Contacts} from '../contact/contact-types'

export namespace FriendApls {
  export type Id = number
  export type Reason = string
  export type Remark = string

  export enum Status {
    pending = 0, // 待确认
    accept = 1, // 同意
    reject = 2 // 拒绝
  }
}

export interface SearchUsersReq {
  usernames: Users.Username[]
}

export interface AddUserReq {
  username: Users.Username
  reason: FriendApls.Reason
  remark: FriendApls.Remark
}

export interface AddUserRetReq {
  friendAplId: FriendApls.Id
  contactId: Contacts.Id
  to: Users.Username
  status: FriendApls.Status
  remark: FriendApls.Remark
}

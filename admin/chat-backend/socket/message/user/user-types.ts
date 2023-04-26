import {Users} from '../../../router/user/user-types'
import {Contacts} from '../contact/contact-types'

export namespace FriendApls {
  export type Reason = string
  export type Remark = string
  export type Status = 0 | 1 | 2
}

export interface SearchUserQuery {
  username: Users.Username
}

export interface AddUserBody {
  username: Users.Username
  reason: FriendApls.Reason
  remark: FriendApls.Remark
}

export interface AddUserRetBody {
  to: Users.Username
  status: FriendApls.Status // 0待确认 1同意 2拒绝
}
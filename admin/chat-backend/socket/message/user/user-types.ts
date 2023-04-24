import {Users} from '../../../router/user/user-types'
import {Contacts} from '../contact/contact-types'

export interface SearchUserQuery {
  username: Users.Username
}

export interface AddUserBody {
  username: Users.Username
  reason: string
}

export interface AddUserRetBody {
  to: Users.Username
  status: number // 0待确认 1同意 2拒绝
}

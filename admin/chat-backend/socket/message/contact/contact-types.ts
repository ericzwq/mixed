import {Users} from '../../../router/user/user-types'

export namespace Contacts {
  export type Id = number
  export type Master = Users.Username
  export type Sub = Users.Username
  export type Status = number
  export type Remark = string
}
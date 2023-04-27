import {Users} from '../../../router/user/user-types'

export namespace Contacts {
  export type Id = number
  export type Master = Users.Username
  export type Sub = Users.Username

  export enum Status {
    normal = 0,
    delete = 1,
    blackList = 2,
    delAndBlack = 3
  }

  export type Remark = string
}

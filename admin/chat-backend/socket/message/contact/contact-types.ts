import {Users} from "../../../router/user/user-types";

export namespace Contacts {
  export type Id = number
  export type Master = Users.Username
  export type Sub = Users.Username
  export type Status = string
}

export interface AddUserBody {
  username: Users.Username,
  status: Contacts.Status
}

export interface AddUserMessage {
  action: string
  data: AddUserBody
}
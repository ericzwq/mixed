import {Users} from "../../../router/user/user-types";

export namespace SgMessages {
  export type Id = number
  export type Target = string // '1-2'
  export type Content = string | number[]
  export type From = Users.Username
  export type To = Users.Username
  export type Type = number // 消息类型
  export type FakeId = string // 前端消息id
  export type CreatedAt = string
  export type Status = number
  export type Ext = string
  export type Next = Id | null
}

export interface SgMsgReq {
  id: SgMessages.Id
  target: SgMessages.Target
  from: SgMessages.From
  to: SgMessages.To
  type: SgMessages.Type
  content: SgMessages.Content
  fakeId: SgMessages.FakeId
  createdAt: SgMessages.CreatedAt
  ext: SgMessages.Ext
  preId: SgMessages.Id
}

export interface SgMsgRes {
  id: SgMessages.Id
  type: SgMessages.Type // 1普通消息 2系统消息 3撤回消息
  fakeId?: SgMessages.FakeId // 前端消息id
  from: SgMessages.From
  to: SgMessages.To
  createdAt?: SgMessages.CreatedAt
  content: SgMessages.Content
  status: SgMessages.Status
  next: SgMessages.Next
}
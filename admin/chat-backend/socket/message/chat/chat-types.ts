import {Users} from '../../../router/user/user-types'

export namespace SgMsgs {
  export type Id = number
  export type Target = string // '1-2'
  export type Content = string | number[]
  export type From = Users.Username
  export type To = Users.Username
  export type Type = number // 消息类型
  export type FakeId = string // 前端消息id
  export type CreatedAt = string

  export enum Status {
    normal = 0,
    revert = 1
  }

  export type Ext = string
  export type Next = Id | null
  export type Pre = Id | null
}

export interface GetHisSgMsgReq {
  maxCount: number | null
  maxId: SgMsgs.Id
  minId: SgMsgs.Id | null
}

export interface SgMsgReq {
  target: SgMsgs.Target
  from: SgMsgs.From
  to: SgMsgs.To
  type: SgMsgs.Type
  content: SgMsgs.Content
  fakeId: SgMsgs.FakeId
  createdAt: SgMsgs.CreatedAt
  ext: SgMsgs.Ext
  preId: SgMsgs.Id
  pre: SgMsgs.Pre
}

export interface SgMsgRes {
  id: SgMsgs.Id
  type: SgMsgs.Type // 1普通消息 2系统消息 3撤回消息
  fakeId?: SgMsgs.FakeId // 前端消息id
  from: SgMsgs.From
  to: SgMsgs.To
  createdAt?: SgMsgs.CreatedAt
  content: SgMsgs.Content
  status: SgMsgs.Status
  next: SgMsgs.Next
  pre: SgMsgs.Pre
}

import {Users} from '../../../router/user/user-types'

export namespace SgMsgs {
  export type Id = number
  export type Target = string // '1-2'
  export type Content = string | number[] | number
  export type From = Users.Username
  export type To = Users.Username

  export enum Type { // 消息类型
    system = 0, // 系统消息
    text = 1, // 文本
    pic = 2, // 图片
    audio = 3, // 音频
    video = 4, // 视频
    retract = 5, // 撤回
  }

  export type FakeId = string // 前端消息id
  export type CreatedAt = string

  export enum Status {
    normal = 0,
    retract = 1
  }

  export type Ext = string
  export type Next = Id | null
  export type Pre = Id | null
}

export interface GetHisSgMsgReq {
  count: number | null
  maxId: SgMsgs.Id
  minId: SgMsgs.Id | null
}

export interface SgMsgReq {
  target: SgMsgs.Target
  type: SgMsgs.Type
  content: SgMsgs.Content
  fakeId: SgMsgs.FakeId
  ext: SgMsgs.Ext
  lastId: SgMsgs.Id
  from: SgMsgs.From
  to: SgMsgs.To
  pre: SgMsgs.Pre
  createdAt: SgMsgs.CreatedAt
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
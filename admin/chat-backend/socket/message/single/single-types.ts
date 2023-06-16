import {Users} from '../../../router/user/user-types'
import {MsgRead, MsgStatus, MsgType, SysMsgCont} from "../../socket-types";

export namespace SgMsgs {
  export type Id = number
  export type Content = string | number[] | number | SysMsgCont[]
  export type From = Users.Username
  export type To = Users.Username
  export type FakeId = string // 前端消息id
  export type CreatedAt = string
  export type Ext = string
  export type Next = Id | null
  export type Pre = Id | null
}

export interface GetHisSgMsgReq {
  count: number | null
  maxId: SgMsgs.Id
  minId: SgMsgs.Id | null
}

export interface SendSgMsgReq {
  type: MsgType
  content: SgMsgs.Content
  fakeId: SgMsgs.FakeId
  ext?: SgMsgs.Ext
  lastId?: SgMsgs.Id
  to: SgMsgs.To
  pre: SgMsgs.Pre // 额外的
}

export interface TransmitSgMsgsReq {
  to: SgMsgs.To
  lastId?: SgMsgs.Id
  msgs: Omit<SendSgMsgReq, 'to' | 'lastId'>[]
}

export interface SgMsgRes {
  id: SgMsgs.Id
  type: MsgType // 1普通消息 2系统消息 3撤回消息
  fakeId?: SgMsgs.FakeId // 前端消息id
  from: SgMsgs.From
  to: SgMsgs.To
  createdAt?: SgMsgs.CreatedAt
  content: SgMsgs.Content
  status: MsgStatus
  next: SgMsgs.Next
  pre: SgMsgs.Pre
  read: MsgRead
}

export interface ReadSgMsgsReq {
  ids: SgMsgs.Id[]
  to: SgMsgs.To
}
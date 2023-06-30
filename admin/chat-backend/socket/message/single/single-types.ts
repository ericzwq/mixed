import {Users} from '../../../router/user/user-types'
import {MsgContent, MsgRead, MsgStatus, MsgType, SysMsgCont} from '../../socket-types'
import {ChatLog, ChatType} from '../common/common-types'

export namespace SgMsgs {
  export type Id = number
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
  content: MsgContent
  fakeId: SgMsgs.FakeId
  lastId?: SgMsgs.Id
  ext?: SgMsgs.Ext
  to: SgMsgs.To
  status: MsgStatus
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
  content: MsgContent
  status: MsgStatus
  next: SgMsgs.Next
  pre: SgMsgs.Pre
  read: MsgRead
}

export interface ReadSgMsgsReq {
  ids: SgMsgs.Id[]
  to: SgMsgs.To
}

export interface GetSgMsgByIdsReq {
  fakeId: string
  data: SgMsgs.Id[]
}

export interface ReplyContent { // 回复的消息格式
  id: SgMsgs.Id
  data: MsgContent
}
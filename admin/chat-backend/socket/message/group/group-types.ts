import {Users} from "../../../router/user/user-types";
import {MsgStatus, MsgType, SysMsgCont} from "../../socket-types";
import {SgMsgRes, SgMsgs} from "../single/single-types";

export namespace Groups {
  export type Id = number
  export type Name = string
  export type Avatar = string
  export type Leader = string
  export type Manager = string | null
  export type Managers = Set<string>
  export type Member = string | null
  export type Members = Set<string>
  export type CreatedAt = string
}

export namespace GpMsgs {
  export type Id = number
  export type Content = string | number[] | number | SysMsgCont[] | GpMsgRes[] | SgMsgRes[]
  export type From = Users.Username
  export type To = Groups.Id
  export type FakeId = string // 前端消息id
  export type CreatedAt = string
  export type Ext = string
  export type Next = Id | null
  export type Pre = Id | null
  export type Reads = Users.Username
  export type ReadCount = number
}

export namespace GpMembers {
  export type prohibition = number
}

export enum GpMemberOrigin {
  author = 0, // 创建者
  invitee = 1, // 被邀请
  apply = 2, // 申请
}

export interface SendGpMsgReq {
  type: MsgType
  content: GpMsgs.Content
  fakeId: GpMsgs.FakeId
  ext?: GpMsgs.Ext
  lastId?: GpMsgs.Id
  to: GpMsgs.To
  pre: GpMsgs.Pre // 额外的
}

export interface TransmitGpMsgsReq {
  to: GpMsgs.To
  lastId?: GpMsgs.Id
  msgs: Omit<SendGpMsgReq, 'to' | 'lastId'>[]
}

export interface GpMsgRes {
  id: GpMsgs.Id
  type: MsgType
  fakeId?: GpMsgs.FakeId // 前端消息id
  from: GpMsgs.From
  to: GpMsgs.To
  createdAt: GpMsgs.CreatedAt
  content: GpMsgs.Content
  status: MsgStatus
  next: GpMsgs.Next
  pre: GpMsgs.Pre
  readCount: GpMsgs.ReadCount
}

export interface Group {
  id: Groups.Id
  name: Groups.Name
  avatar: Groups.Avatar
  leader: Groups.Leader
  manager: Groups.Manager
  managers: Groups.Managers
  member: Groups.Member
  members: Groups.Members
  createdAt: Groups.CreatedAt
}

export interface GetGroupsRes {
  id: Groups.Id
  name: Groups.Name
  avatar: Groups.Avatar
}

export namespace GroupApls {
  export type Id = Groups.Id
  export type  Reason = string
  export type Pre = Id
  export type Next = Id
  export type Invitee = Users.Username
  export type From = Users.Username
  export type CreatedAt = string

  export enum Type {
    active = 1, // 加群申请
    passive = 2 // 邀请申请
  }

  export enum Status {
    pending = 0,  // 待确认
    accept = 1, // 同意
    reject = 2 // 拒绝
  }
}

export interface AddGroupReq {
  id: Groups.Id
  reason: GroupApls.Reason
}

export interface GroupInviteRetReq {
  id: GroupApls.Id
  status: GroupApls.Status
}

export interface GroupInviteRetRes {
  id: GroupApls.Id
  status: GroupApls.Status
  createdAt: GroupApls.CreatedAt
}

export interface AddGroupRetReq {
  to: Users.Username
  status: GroupApls.Status
}

export interface CreateGroupReq {
  members: Users.Username[]
  name: Groups.Name
  avatar?: Groups.Avatar
}

export interface GroupInviteReq {
  members: Users.Username[]
  to: Groups.Id
}

export interface GetGroupAplsReq {
  lastGroupAplId?: GroupApls.Id
}

export interface ReadGpMsgsReq {
  ids: GpMsgs.Id[]
  to: GpMsgs.To
}

export interface GetHisGpMsgReq {
  count: number | null
  maxId: SgMsgs.Id
  minId: SgMsgs.Id | null
}
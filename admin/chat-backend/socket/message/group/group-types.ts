import {Users} from "../../../router/user/user-types";

export namespace Groups {
  export type Id = string
  export type Name = string
  export type Avatar = string
  export type Leader = string
  export type Manager = string
  export type Managers = Set<string>
  export type Member = string
  export type Members = Set<string>
  export type CreatedAt = string
}

export namespace GpMsgs {
  export type Id = number
  export type Target = string // '1-2'
  export type Content = string | number[] | number
  export type From = Users.Username
  export type To = Groups.Id
  export type FakeId = string // 前端消息id
  export type CreatedAt = string
  export type Ext = string
  export type Next = Id | null
  export type Pre = Id | null
}

export interface Group {
  id: Groups.Id
  name: Groups.Name
  avatar: Groups.Avatar
  leader: Groups.Leader
  manager?: Groups.Manager
  managers: Groups.Managers
  member?: Groups.Member
  members: Groups.Members
  createdAt: Groups.CreatedAt
}

export namespace GroupApls {
  export type Id = Groups.Id
  export type  Reason = string
  export type Pre = number
  export type Next = number

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

export interface AddGroupRetReq {
  to: Users.Username
  status: GroupApls.Status
}

export interface CreateGroupReq {
  members: Users.Username[]
  name: Groups.Name
}
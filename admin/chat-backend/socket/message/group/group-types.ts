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
  export type  Reason = string

  export enum Status {
    pending = 0,  // 待确认
    accept = 1, // 同意
    reject = 2 // 拒绝
  }
}

export interface AddGroupBody {
  id: Groups.Id
  reason: GroupApls.Reason
}

export interface AddGroupRetBody {
  to: Users.Username
  status: GroupApls.Status
}
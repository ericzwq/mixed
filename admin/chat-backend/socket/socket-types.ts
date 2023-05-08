import {User, Users} from '../router/user/user-types'
import * as WebSocket from 'ws'
import {IncomingMessage} from 'http'
import {SocketResponseOptions} from "../response/response";
import {PoolConnection} from "mysql";

export namespace Messages {
  export type Target = string // '1-2'
  export type Content = string | number[]
  export type From = Users.Username
  export type To = Users.Username
  export type Type = number // 消息类型
  export type FakeId = string // 前端消息id
  export type CreatedAt = string
  export type Status = number
  export type Ext = string
}

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

export interface ExtWebSocket extends WebSocket.WebSocket {
  connection: PoolConnection
  json: (socketResponseOptions: SocketResponseOptions, options?: any, cb?: any) => void
  sqlCommit: boolean
  shouldUpdateUser: boolean // 是否需要更新用户数据
}

export interface RequestMessage<T = null> {
  action: string
  data: T
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

export interface Message {
  action: string
  target: Messages.To
  from: Messages.From
  to: Messages.To
  type: Messages.Type
  content: Messages.Content
  fakeId: Messages.FakeId
  createdAt: Messages.CreatedAt
  ext: Messages.Ext
}

export interface SocketData {
  type: number // 1普通消息 2系统消息 3撤回消息
  fakeId?: string // 前端消息id
  from: Users.Username
  to: Users.Username
  createdAt?: string
  data: Messages.Content
  status: Messages.Status
}

export namespace Voices {
  export type Action = string
  export type Agree = boolean
  export type To = string
}

export interface OfferMessage {
  status: number
  action: string
  data: {
    offer: any
    from: Users.Username
    to: Users.Username
  }
}

export interface AnswerMessage {
  status: number
  action: string
  data: {
    answer: any
    from: Users.Username
    to: Users.Username
  }
}

export interface CandidateMessage {
  status: number
  action: string
  data: {
    candidate: any
    from: Users.Username
    to: Users.Username
  }
}

export interface VoiceResult {
  action: Voices.Action
  data: {
    agree: Voices.Agree
    to: Voices.To
  }
}

export type MessageHandler = (ws: ExtWebSocket, session: User, data: any) => void

export interface ActionHandlerMap {
  [key: string]: MessageHandler
}

export type ConnectionHandler = (session: User, cookie: string, ws: ExtWebSocket, req: IncomingMessage, params: any) => void

export interface ConnectionHandlerMap {
  [key: string]: ConnectionHandler
}

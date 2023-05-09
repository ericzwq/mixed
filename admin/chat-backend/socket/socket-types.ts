import {User, Users} from '../router/user/user-types'
import * as WebSocket from 'ws'
import {IncomingMessage} from 'http'
import {SocketResponseOptions} from "../response/response";
import {PoolConnection} from "mysql";

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

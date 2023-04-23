import {SessionData, Users} from "../../router/user/user-types";
import {IncomingMessage} from "http";
import {SocketResponseSchema} from "../../response/response";
import {CONN_VOICE, VOICE_RESULT} from "../socket-actions";
import WebSocket = require("ws");
import {usernameClientMap} from "../message/chat/chat";

export const voiceClientMap = new Map<Users.Username, WebSocket.WebSocket>()

export function voice(session: SessionData, cookie: string, ws: WebSocket.WebSocket, req: IncomingMessage, params: any) {
  const username = params.username
  voiceClientMap.set(session.username, ws)
  if (!voiceClientMap.has(username)) { // 对方未连接
    console.log(username, !!usernameClientMap[username])
    usernameClientMap[username]?.send(JSON.stringify(new SocketResponseSchema({action: CONN_VOICE, data: {from: session.username, to: username}})))
  } else { // 对方已连接
    usernameClientMap[username]?.send(JSON.stringify(new SocketResponseSchema({action: VOICE_RESULT, data: {from: session.username, to: username, agree: true}})))
  }
  ws.on('message', async (data, isBinary) => {
    if (!isBinary) return ws.send('请发送二进制数据')
    usernameClientMap[username]?.send(data)
    console.log(data)
  })

  ws.on('error', e => {
    console.log('error', e)
  })

  ws.on('close', (e) => {
    console.log('close', e)
  })
}
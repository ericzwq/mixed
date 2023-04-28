import {MessageHandler, ActionHandlerMap, Message, ExtWebSocket} from '../socket-types'
import {SessionData} from '../../router/user/user-types'
import {IncomingMessage} from 'http'
import {getChatData} from './chat/chat-sql'
import {ADD_GROUP, ADD_GROUP_RET, ADD_USER, ADD_USER_RET, ANSWER, GET_CONTACTS, OFFER, REC_MSGS, SEARCH_USERS, VOICE_RESULT} from '../socket-actions'
import {formatDate} from '../../common/utils'
import client from '../../redis/redis'
import {usernameClientMap, sendMessage} from './chat/chat'
import {getContacts} from './contact/contact'
import {answer, candidate, offer, voiceResult} from './mediaCall/mediaCall'
import {CANCELLED} from 'dns'
import {addUser, addUserRet, searchUsers} from './user/user'
import {addGroup, addGroupRet} from "./group/group";
import {commitSocketSql, socketSqlMiddleware} from "../../db";

const socketMessageRouter = {
  actionHandlerMap: {} as ActionHandlerMap,
  addHandler(action: string, handler: MessageHandler) {
    this.actionHandlerMap[action] = handler
  },
  addHandlers(routes: { action: string, handler: MessageHandler }[]) {
    for (const route of routes) {
      this.actionHandlerMap[route.action] = route.handler
    }
  }
}

export async function handleMessage(session: SessionData, cookie: string, ws: ExtWebSocket, req: IncomingMessage) {
  await socketSqlMiddleware(ws)
  usernameClientMap[session.username] = ws
  const {result} = await getChatData(ws, session)
  ws.connection.release()

  ws.json({data: result, action: REC_MSGS})

  ws.on('message', async (_data, isBinary) => {
    let data: Message
    if (isBinary) {

    } else {
      try {
        data = JSON.parse(_data.toString())
      } catch (e) {
        console.log('数据格式错误', e)
        return ws.json({status: 1001, message: '数据格式错误'})
      }
      const handler = socketMessageRouter.actionHandlerMap[data.action]
      if (!handler) return ws.json({status: 1002, message: '未知的action'})
      await socketSqlMiddleware(ws)
      await handler(ws, session, data)
      if (ws.sqlCommit) await commitSocketSql(ws)
      ws.connection.release()
    }
  })

  ws.on('error', e => {
    session.leaveTime = formatDate()
    client.set(cookie, JSON.stringify(session))
    console.log('error', e)
  })

  ws.on('close', (e) => {
    session.leaveTime = formatDate()
    client.set(cookie, JSON.stringify(session))
    console.log('close', e)
  })
}

// todo call
/*socketMessageRouter.addHandler('callCommand', function (ws: WebSocket, session: SessionData, data) {
  const {from, to} = data
  const fromClient = phoneMap[from]
  if (!fromClient) return ws.send(JSON.stringify(new SocketResponseSchema({status: 1, message: '拨打方：' + from + ' 不在线'})))
  const toClient = phoneMap[to]
  if (!toClient) return ws.send(JSON.stringify(new SocketResponseSchema({status: 2, message: '接听方：' + to + ' 不在线'})))
  fromClient.send(JSON.stringify(new SocketResponseSchema({action: 'call', data: {to}})))
  toClient.send(JSON.stringify(new SocketResponseSchema({action: 'answer', data: {from}})))
})
socketMessageRouter.addHandler('stop', function (ws: WebSocket, session: SessionData, data) {
  const {from, to} = data
  const fromClient = phoneMap[from]
  if (!fromClient) return ws.send(JSON.stringify(new SocketResponseSchema({status: 1, message: '拨打方：' + from + ' 不在线'})))
  const toClient = phoneMap[to]
  if (!toClient) return ws.send(JSON.stringify(new SocketResponseSchema({status: 2, message: '接听方：' + to + ' 不在线'})))
  fromClient.send(JSON.stringify(new SocketResponseSchema({action: 'stop'})))
  toClient.send(JSON.stringify(new SocketResponseSchema({action: 'stop'})))
})*/

socketMessageRouter.addHandler('sendMessage', sendMessage)
socketMessageRouter.addHandlers([{action: GET_CONTACTS, handler: getContacts}])
socketMessageRouter.addHandlers([
  {action: VOICE_RESULT, handler: voiceResult},
  {action: CANCELLED, handler: candidate},
  {action: OFFER, handler: offer},
  {action: ANSWER, handler: answer}
])
socketMessageRouter.addHandlers([
  {action: ADD_USER, handler: addUser},
  {action: SEARCH_USERS, handler: searchUsers},
  {action: ADD_USER_RET, handler: addUserRet}
])
socketMessageRouter.addHandlers([
  {action: ADD_GROUP, handler: addGroup},
  {action: ADD_GROUP_RET, handler: addGroupRet}
])
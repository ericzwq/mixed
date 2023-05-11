import {MessageHandler, ActionHandlerMap, ExtWebSocket, RequestMessage} from '../socket-types'
import {User} from '../../router/user/user-types'
import {IncomingMessage} from 'http'
import {getChatData} from './chat/chat-sql'
import {ADD_GROUP, ADD_GROUP_RET, ADD_USER, ADD_USER_RET, ANSWER, GET_CONTACTS, GET_FRIEND_APLS, GET_HIS_SG_MSGS, OFFER, REC_MSGS, SEARCH_USERS, SEND_MSG, VOICE_RESULT} from '../socket-actions'
import {formatDate, log} from '../../common/utils'
import client from '../../redis/redis'
import {usernameClientMap, sendMessage, getHisSgMsgs} from './chat/chat'
import {getContacts} from './contact/contact'
import {answer, candidate, offer, voiceResult} from './mediaCall/mediaCall'
import {CANCELLED} from 'dns'
import {addUser, addUserRet, getFriendApls, searchUsers} from './user/user'
import {addGroup, addGroupRet} from './group/group'
import {commitSocketSql, socketSqlMiddleware} from '../../db'
import {SgMsgReq} from './chat/chat-types'

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

export async function handleMessage(user: User, cookie: string, ws: ExtWebSocket, req: IncomingMessage) {
  await socketSqlMiddleware(ws)
  usernameClientMap[user.username] = ws
  const {result} = await getChatData(ws, user)
  ws.connection.release()

  ws.json({data: result, action: REC_MSGS})

  ws.on('message', async (_data, isBinary) => {
    if (ws.shouldUpdateUser) {
      ws.shouldUpdateUser = false
      const newValue = await client.get(cookie)
      if (!newValue) {
        user.login = false
        log('未登录', user.username, cookie)
        return ws.json({message: '未登录', status: 401, action: ''})
      }
      Object.assign(user, JSON.parse(newValue))
    }
    let data: RequestMessage<SgMsgReq>
    if (isBinary) {

    } else {
      try {
        data = JSON.parse(_data.toString())
      } catch (e) {
        log('数据格式错误', e)
        return ws.json({status: 1001, message: '数据格式错误'})
      }
      log('action：' + data.action)
      const handler = socketMessageRouter.actionHandlerMap[data.action]
      if (!handler) return ws.json({status: 1002, message: '未知的action'})
      await socketSqlMiddleware(ws)
      await handler(ws, user, data)
      if (ws.sqlCommit) await commitSocketSql(ws)
      ws.connection.release()
    }
  })

  ws.on('error', e => {
    user.leaveTime = formatDate()
    client.set(cookie, JSON.stringify(user))
    log('error', e)
  })

  ws.on('close', (e) => {
    user.leaveTime = formatDate()
    client.set(cookie, JSON.stringify(user))
    log('close', e)
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

socketMessageRouter.addHandlers([
  {action: SEND_MSG, handler: sendMessage},
  {action: GET_HIS_SG_MSGS, handler: getHisSgMsgs}
])
socketMessageRouter.addHandlers([{action: GET_CONTACTS, handler: getContacts}])
socketMessageRouter.addHandlers([
  {action: VOICE_RESULT, handler: voiceResult},
  {action: CANCELLED, handler: candidate},
  {action: OFFER, handler: offer},
  {action: ANSWER, handler: answer}
])
socketMessageRouter.addHandlers([
  {action: GET_FRIEND_APLS, handler: getFriendApls},
  {action: ADD_USER, handler: addUser},
  {action: SEARCH_USERS, handler: searchUsers},
  {action: ADD_USER_RET, handler: addUserRet}
])
socketMessageRouter.addHandlers([
  {action: ADD_GROUP, handler: addGroup},
  {action: ADD_GROUP_RET, handler: addGroupRet}
])

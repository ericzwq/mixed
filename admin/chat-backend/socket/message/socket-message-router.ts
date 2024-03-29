import {MessageHandler, ActionHandlerMap, ExtWebSocket, RequestMessage} from '../socket-types'
import {User} from '../../router/user/user-types'
import {IncomingMessage} from 'http'
import {
  JOIN_GROUP,
  JOIN_GROUP_RET,
  ADD_USER,
  ADD_USER_RET,
  ANSWER,
  CREAT_GROUP,
  GET_CONTACTS,
  GET_FRIEND_APLS,
  GET_HIS_SG_MSGS,
  GROUP_INVITE_RET,
  OFFER,
  READ_SG_MSGS,
  REC_SG_MSGS,
  SEARCH_USERS,
  SEND_SG_MSG,
  VOICE_RESULT,
  GET_GROUP_APLS,
  READ_GP_MSGS,
  SEND_GP_MSG,
  GROUP_INVITE,
  GET_HIS_GP_MSGS,
  GET_GROUP_INFO,
  GET_GROUP_MEMBERS,
  GET_GROUPS,
  TRANSMIT_SG_MSGS,
  TRANSMIT_GP_MSGS, GET_GP_MSGS_BY_IDS, GET_SG_MSGS_BY_IDS
} from '../socket-actions'
import {formatDate, log} from '../../common/utils'
import client from '../../redis/redis'
import {usernameClientMap, sendSgMsg, getHisSgMsgs, readSgMsgs, transmitSgMsgs, getSgMsgsByIds} from './single/single'
import {getContacts} from './contact/contact'
import {answer, candidate, offer, voiceResult} from './mediaCall/mediaCall'
import {CANCELLED} from 'dns'
import {addUser, addUserRet, getFriendApls, searchUsers} from './user/user'
import {
  joinGroup,
  joinGroupRet,
  createGroup,
  groupInviteRet,
  getGroupApls,
  readGpMsgs,
  sendGpMsg,
  groupInvite,
  getHisGpMsgs,
  getGroupInfo,
  getGroupMembers, getGroups, transmitGpMsgs, getGpMsgsByIds
} from './group/group'
import {commitSocketSql, rollbackSocketSql, socketSqlMiddleware} from '../../db'
import {SendSgMsgReq} from './single/single-types'
import {getMsgsById} from './common/common'

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
  // await socketSqlMiddleware(ws)
  usernameClientMap[user.username] = ws
  // const {result} = await getChatData(ws, user)
  // ws.connection.release()

  // ws.json({data: result, action: REC_SG_MSGS})

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
    let data: RequestMessage<SendSgMsgReq>
    if (isBinary) {

    } else {
      try {
        data = JSON.parse(_data.toString())
      } catch (e) {
        log('数据格式错误', e)
        return ws.json({status: 1001, message: '数据格式错误'})
      }
      const handler = socketMessageRouter.actionHandlerMap[data.action]
      if (!handler) return ws.json({status: 1002, message: '未知的action'})
      ws.reqCount = (ws.reqCount || 0) + 1
      if (ws.reqCount === 1) await socketSqlMiddleware(ws)
      try {
        log('======> action：' + data.action, ws.reqCount)
        await handler(ws, user, data)
        if (ws.sqlCommit) await commitSocketSql(ws)
      } catch (e) {
        log('【handler error】', e)
        if (ws.sqlCommit) await rollbackSocketSql(ws)
      }
      log('<====== action：' + data.action, ws.reqCount - 1)
      if (--ws.reqCount === 0) ws.connection.release()
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
  {action: SEND_SG_MSG, handler: sendSgMsg},
  {action: GET_HIS_SG_MSGS, handler: getHisSgMsgs},
  {action: READ_SG_MSGS, handler: readSgMsgs},
  {action: TRANSMIT_SG_MSGS, handler: transmitSgMsgs},
  {action: GET_SG_MSGS_BY_IDS, handler: getSgMsgsByIds},
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
  {action: CREAT_GROUP, handler: createGroup},
  {action: GROUP_INVITE, handler: groupInvite},
  {action: GROUP_INVITE_RET, handler: groupInviteRet},
  {action: JOIN_GROUP, handler: joinGroup},
  {action: JOIN_GROUP_RET, handler: joinGroupRet},
  {action: GET_GROUP_APLS, handler: getGroupApls},
  {action: READ_GP_MSGS, handler: readGpMsgs},
  {action: SEND_GP_MSG, handler: sendGpMsg},
  {action: GET_HIS_GP_MSGS, handler: getHisGpMsgs},
  {action: GET_GROUP_INFO, handler: getGroupInfo},
  {action: GET_GROUP_MEMBERS, handler: getGroupMembers},
  {action: GET_GROUPS, handler: getGroups},
  {action: TRANSMIT_GP_MSGS, handler: transmitGpMsgs},
  {action: GET_GP_MSGS_BY_IDS, handler: getGpMsgsByIds},
])

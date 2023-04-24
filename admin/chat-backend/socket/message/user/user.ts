import {checkMessageParams} from '../../../common/utils'
import {SocketResponseSchema} from '../../../response/response'
import WebSocket = require('ws')
import {SessionData} from '../../../router/user/user-types'
import {AddUserBody, AddUserRetBody, SearchUserQuery} from './user-types'
import {
  addContactRemark,
  selectContactByAddUser,
  searchUserByUsername,
  selectFriendApplicationByAddUser,
  addFriendApplication,
  resetFriendApplication,
  updateFriendApplicationStatus, updateContactStatus, updateContactRemarkAndStatusById
} from './user-sql'
import {addUserRetSchema, addUserSchema, searchUserSchema} from './user-schema'
import {RequestMessage} from '../../socket-types'
import {usernameClientMap} from '../chat/chat'
import {RECEIVE_ADD_USER} from '../../socket-actions'


export async function searchUsers(ws: WebSocket, session: SessionData, data: RequestMessage<SearchUserQuery>) {
  await checkMessageParams(ws, searchUserSchema, data.data, 1011)
  const {result} = await searchUserByUsername(data.data.username)
  ws.send(new SocketResponseSchema({action: data.action, message: '查询成功', status: 0, data: result}).toString())
}

export async function addUser(ws: WebSocket.WebSocket, session: SessionData, data: RequestMessage<AddUserBody>) {
  await checkMessageParams(ws, addUserSchema, data.data, 1012)
  const {username: to, reason, remark} = data.data
  const from = session.username
  const {result} = await selectFriendApplicationByAddUser(to, from)
  if (!result.length) {
    await addFriendApplication(to, from, reason)
  } else {
    const status = result[0].status
    if (status === 0) return ws.send(new SocketResponseSchema({message: '请勿重复申请', status: 1013}).toString())
    if (status === 1) return ws.send(new SocketResponseSchema({message: '目标用户已是您的好友', status: 1014}).toString())
    await resetFriendApplication(to, from, reason)
  }
  const result2 = (await selectContactByAddUser(to, from)).result
  if (result2.length) {
    if (result2[0].status !== 1) return ws.send(new SocketResponseSchema({action: data.action, message: '他已是您的好友', status: 1017}).toString())
    await updateContactRemarkAndStatusById(result2[0].id, remark)
  } else {
    await addContactRemark(to, from, remark)
  }
  usernameClientMap[to]?.send(new SocketResponseSchema({action: RECEIVE_ADD_USER, data: {from}}).toString())
  ws.send(new SocketResponseSchema({action: data.action, message: '申请成功'}).toString())
}

export async function addUserRet(ws: WebSocket.WebSocket, session: SessionData, data: RequestMessage<AddUserRetBody>) {
  await checkMessageParams(ws, addUserRetSchema, data.data, 1015)
  const {to, status: _status} = data.data
  const from = session.username
  const {result} = await updateFriendApplicationStatus(to, from, _status)
  if (!result.affectedRows) return ws.send(new SocketResponseSchema({message: '无申请记录或已修改该记录', status: 1016}).toString())
  if (_status === 2) return // 拒绝
  await updateContactStatus(to, from, 0)
  const msg = new SocketResponseSchema({action: data.action}).toString()
  ws.send(msg)
  usernameClientMap[to]?.send(msg)
}

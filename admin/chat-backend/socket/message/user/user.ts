import {checkMessageParams} from '../../../common/utils'
import {SocketResponseSchema} from '../../../response/response'
import WebSocket = require('ws')
import {SessionData} from '../../../router/user/user-types'
import {AddUserBody, AddUserRetBody, SearchUserQuery} from './user-types'
import {
  addUserByUsername,
  selectContactByAddUser,
  searchUserByUsername,
  selectFriendApplicationByAddUser,
  addFriendApplication,
  resetFriendApplication,
  updateFriendApplicationByConfirm
} from './user-sql'
import {addUserRetSchema, addUserSchema, searchUserSchema} from './user-schema'
import {RequestMessage} from '../../socket-types'
import {usernameClientMap} from '../chat/chat'
import {RECEIVE_ADD_USER} from '../../socket-actions'


export async function searchUsers(ws: WebSocket, session: SessionData, data: RequestMessage<SearchUserQuery>) {
  await checkMessageParams(ws, searchUserSchema, data.data, 1011)
  const {result} = await searchUserByUsername(data.data)
  ws.send(JSON.stringify(new SocketResponseSchema({action: data.action, message: '查询成功', status: 0, data: result})))
}

export async function addUser(ws: WebSocket.WebSocket, session: SessionData, data: RequestMessage<AddUserBody>) {
  await checkMessageParams(ws, addUserSchema, data.data, 1012)
  const {username: to} = data.data
  const from = session.username
  const {result} = await selectFriendApplicationByAddUser(to, from)
  if (!result.length) {
    await addFriendApplication(to, from)
  } else {
    const status = result[0].status
    if (status === 0) return ws.send(JSON.stringify(new SocketResponseSchema({message: '请勿重复申请', status: 1013})))
    if (status === 1) return ws.send(JSON.stringify(new SocketResponseSchema({message: '目标用户已是您的好友', status: 1014})))
    await resetFriendApplication(to, from)
  }
  usernameClientMap[to]?.send(JSON.stringify(new SocketResponseSchema({action: RECEIVE_ADD_USER, data: {from}})))
  ws.send(JSON.stringify(new SocketResponseSchema({action: data.action, message: '申请成功'})))
}

export async function addUserRet(ws: WebSocket.WebSocket, session: SessionData, data: RequestMessage<AddUserRetBody>) {
  await checkMessageParams(ws, addUserRetSchema, data.data, 1015)
  const {to, status: _status} = data.data
  const from = session.username
  const {result} = await updateFriendApplicationByConfirm(to, from, _status)
  if (!result.affectedRows) return ws.send(JSON.stringify(new SocketResponseSchema({message: '无申请记录或已修改该记录', status: 1016})))
  if (_status === 2) return // 拒绝
  const {result: result2} = await selectContactByAddUser(to, from)
  console.log(result2)
  let status = '00', isMaster = true, isInsert = true
  if (result2.length) { // 删除或删除并拉黑
    isInsert = false
    status = result2[0].status
    isMaster = result2[0].master === from
    console.log(isMaster)
    // if (['0', '2'].includes(result2[0].status[isMaster ? 0 : 1])) {
    //   return ws.send(JSON.stringify(new SocketResponseSchema({message: '请勿重复添加', status: 1013})))
    // }
  }
  if (isMaster) { // 目标是sub
    status = '0' + status[1]
  } else { // 目标是master
    status = status[0] + '0'
  }
  await addUserByUsername(to, from, status, isInsert, isMaster)
  const msg = JSON.stringify(new SocketResponseSchema({action: data.action}))
  ws.send(msg)
  usernameClientMap[to]?.send(msg)
}

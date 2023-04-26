import {checkMessageParams} from '../../../common/utils'
import {SessionData} from '../../../router/user/user-types'
import {AddUserBody, AddUserRetBody, SearchUserQuery} from './user-types'
import {
  addContactRemark,
  selectContactByAddUser,
  searchUserByUsername,
  selectFriendAplByAddUser,
  addFriendApl,
  resetFriendApl,
  updateFriendAplStatus, updateContactStatus, updateContactRemarkAndStatusById
} from './user-sql'
import {addUserRetSchema, addUserSchema, searchUserSchema} from './user-schema'
import {ExtWebSocket, RequestMessage} from '../../socket-types'
import {usernameClientMap} from '../chat/chat'


export async function searchUsers(ws: ExtWebSocket, session: SessionData, data: RequestMessage<SearchUserQuery>) {
  await checkMessageParams(ws, searchUserSchema, data.data, 1011)
  const {result} = await searchUserByUsername(data.data.username)
  ws.json({action: data.action, message: '查询成功', status: 0, data: result})
}

export async function addUser(ws: ExtWebSocket, session: SessionData, data: RequestMessage<AddUserBody>) {
  await checkMessageParams(ws, addUserSchema, data.data, 1012)
  const {username: to, reason, remark} = data.data
  const from = session.username
  const {result} = await selectFriendAplByAddUser(to, from)
  if (!result.length) {
    await addFriendApl(to, from, reason)
  } else {
    const status = result[0].status
    if (status === 0) return ws.json({message: '请勿重复申请', status: 1013})
    if (status === 1) return ws.json({message: '目标用户已是您的好友', status: 1014})
    await resetFriendApl(to, from, reason)
  }
  const result2 = (await selectContactByAddUser(to, from)).result
  if (result2.length) {
    if (result2[0].status !== 1) return ws.json({action: data.action, message: '他已是您的好友', status: 1017})
    await updateContactRemarkAndStatusById(result2[0].id, remark)
  } else {
    await addContactRemark(to, from, remark)
  }
  usernameClientMap[to]?.json({action: data.action, data: {from, reason, nickname: session.nickname, avatar: session.avatar}})
  ws.json({action: data.action, message: '申请成功', data: {from}})
}

export async function addUserRet(ws: ExtWebSocket, session: SessionData, data: RequestMessage<AddUserRetBody>) {
  await checkMessageParams(ws, addUserRetSchema, data.data, 1015)
  const {to, status: _status} = data.data
  const from = session.username
  const {result} = await updateFriendAplStatus(to, from, _status)
  if (!result.affectedRows) return ws.json({message: '无申请记录或已修改该记录', status: 1016})
  if (_status === 2) return // 拒绝
  await updateContactStatus(to, from, 0)
  ws.json({action: data.action, data: {from}})
  usernameClientMap[to]?.json({action: data.action, data: {from, to}})
}

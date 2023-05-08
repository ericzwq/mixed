import {checkMessageParams, formatDate, notifyUpdateUser} from '../../../common/utils'
import {User, Users} from '../../../router/user/user-types'
import {AddUserBody, AddUserRetBody, FriendApls, SearchUserQuery} from './user-types'
import {
  addContactByMasterAndSub,
  selectContactByAddUser,
  getUserByUsername,
  selectFriendAplByAddUser,
  addFriendApl,
  resetFriendAplById,
  updateFriendAplStatus, updateContactStatus, resetContactById, updateLastFriendAplId, selectFriendAplsById
} from './user-sql'
import {addUserRetSchema, addUserSchema, getFriendAplsSchema, searchUserSchema} from './user-schema'
import {ExtWebSocket, RequestMessage} from '../../socket-types'
import {usernameClientMap} from '../chat/chat'
import {REC_ADD_USER, REC_ADD_USER_RET} from '../../socket-actions'
import {Contacts} from '../contact/contact-types'
import {beginSocketSql} from "../../../db";
import client from "../../../redis/redis";


export async function searchUsers(ws: ExtWebSocket, user: User, data: RequestMessage<SearchUserQuery>) {
  await checkMessageParams(ws, searchUserSchema, data.data, 1011)
  const {result} = await getUserByUsername(ws, data.data.username)
  ws.json({action: data.action, message: '查询成功', data: result})
}

// 获取好友申请记录
export async function getFriendApls(ws: ExtWebSocket, user: User, data: RequestMessage<{ lastFriendAplId: Users.LastFriendAplId }>) {
  await checkMessageParams(ws, getFriendAplsSchema, data.data, 1019)
  const {result} = await selectFriendAplsById(ws, user.username, data.data.lastFriendAplId)
  ws.json({action: data.action, message: '查询成功', data: result})
}

export async function addUser(ws: ExtWebSocket, user: User, data: RequestMessage<AddUserBody>) {
  await checkMessageParams(ws, addUserSchema, data.data, 1012)
  const {username: to, reason, remark} = data.data
  const {result: users} = await getUserByUsername(ws, to)
  if (!users.length) return ws.json({status: 1018, message: '该用户不存在'})
  const from = user.username
  const {result} = await selectFriendAplByAddUser(ws, to, from)
  let friendAplId: number
  await beginSocketSql(ws)
  if (!result.length) {
    const {result: {insertId}} = await addFriendApl(ws, to, from, reason)
    friendAplId = insertId
    await updateLastFriendAplId(ws, [from, to], friendAplId)
    user.lastFriendAplId = friendAplId
    await client.set((await client.get(from))!, JSON.stringify(user))
    const sessionId = await client.get(to)
    if (sessionId) {
      const toUser: User = JSON.parse((await client.get(sessionId)) || JSON.stringify({login: false}))
      toUser.lastFriendAplId = friendAplId
      await client.set(sessionId, JSON.stringify(toUser))
    }
    notifyUpdateUser(to)
  } else {
    friendAplId = result[0].id
    const status = result[0].status
    if (status === FriendApls.Status.pending) return ws.json({message: '请勿重复申请', status: 1013})
    if (status === FriendApls.Status.accept) return ws.json({message: '该用户已是您的好友', status: 1014})
    await resetFriendAplById(ws, friendAplId, reason)
  }
  const result2 = (await selectContactByAddUser(ws, to, from)).result
  let contactId: number
  if (result2.length) {
    if (result2[0].status !== Contacts.Status.delete) return ws.json({action: data.action, message: '他已是您的好友', status: 1017})
    contactId = result2[0].id
    await resetContactById(ws, contactId, remark)
  } else {
    const {result: {insertId}} = await addContactByMasterAndSub(ws, to, from, Contacts.Status.delete, remark)
    contactId = insertId
  }
  const status = FriendApls.Status.pending
  let {nickname, avatar} = user
  usernameClientMap[to]?.json({action: REC_ADD_USER, data: {friendAplId, contactId, from, reason, nickname, avatar, status}});
  ({nickname, avatar} = users[0])
  ws.json({action: data.action, message: '申请成功', data: {friendAplId, from, nickname, avatar, reason, status}})
}

export async function addUserRet(ws: ExtWebSocket, user: User, data: RequestMessage<AddUserRetBody>) {
  await checkMessageParams(ws, addUserRetSchema, data.data, 1015)
  const {friendAplId, contactId, to, status, remark} = data.data
  const from = user.username
  const updatedAt = formatDate()
  await beginSocketSql(ws)
  const {result} = await updateFriendAplStatus(ws, friendAplId, from, to, status, updatedAt)
  if (!result.affectedRows) return ws.json({message: '无申请记录或已修改该记录', status: 1016})
  if (status === FriendApls.Status.accept) { // 接受
    const {result: {affectedRows}} = await updateContactStatus(ws, contactId, from, to, Contacts.Status.normal)
    if (!affectedRows) return ws.json({status: 1019, message: 'contactId不匹配'})
    await addContactByMasterAndSub(ws, to, from, Contacts.Status.normal, remark)
  }
  ws.json({action: data.action, data: {friendAplId, from, status, updatedAt}})
  usernameClientMap[to]?.json({action: REC_ADD_USER_RET, data: {friendAplId, from, to, status, updatedAt}})
}

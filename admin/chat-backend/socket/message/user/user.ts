import {checkMessageParams, createFakeId, formatDate, notifyUpdateUser, updateUser} from '../../../common/utils'
import {User, Users} from '../../../router/user/user-types'
import {AddUserReq, AddUserRetReq, FriendApls, SearchUserQuery} from './user-types'
import {getUserByUsername} from './user-sql'
import {addUserRetSchema, addUserSchema, getFriendAplsSchema, searchUserSchema} from './user-schema'
import {ExtWebSocket, MsgRead, MsgStatus, MsgType, RequestMessage} from '../../socket-types'
import {usernameClientMap} from '../single/single'
import {REC_ADD_USER, REC_ADD_USER_RET, REC_SG_MSGS} from '../../socket-actions'
import {Contacts} from '../contact/contact-types'
import {beginSocketSql} from '../../../db'
import client from '../../../redis/redis'
import {SgMsgReq, SgMsgRes} from '../single/single-types'
import {
  addFriendApl,
  addSgMsg,
  resetFriendAplById,
  selectFriendAplByAddUser,
  selectFriendAplsById,
  updateFriendAplStatus,
  updateLastFriendAplId
} from '../single/single-sql'
import {addContactByMasterAndSub, resetContactById, selectContactBySub, updateContactStatus} from "../contact/contact-sql";


export async function searchUsers(ws: ExtWebSocket, user: User, data: RequestMessage<SearchUserQuery>) {
  await checkMessageParams(ws, searchUserSchema, data.data, 1011)
  const {result} = await getUserByUsername(ws, data.data.username)
  ws.json({action: data.action, message: '查询成功', data: result})
}

// 获取好友申请记录
export async function getFriendApls(ws: ExtWebSocket, user: User, data: RequestMessage<{ lastFriendAplId: Users.LastFriendAplId }>) {
  await checkMessageParams(ws, getFriendAplsSchema, data.data, 1019)
  const {result} = await selectFriendAplsById(ws, user.username, data.data.lastFriendAplId, user.lastFriendAplId)
  ws.json({action: data.action, message: '查询成功', data: result.reverse()})
}

export async function addUser(ws: ExtWebSocket, user: User, data: RequestMessage<AddUserReq>) {
  await checkMessageParams(ws, addUserSchema, data.data, 1012)
  const {username: to, reason, remark} = data.data
  const {result: users} = await getUserByUsername(ws, to)
  if (!users.length) return ws.json({status: 1018, message: '该用户不存在'})
  const from = user.username
  const result2 = (await selectContactBySub(ws, to, from)).result
  let contactId: number
  await beginSocketSql(ws)
  if (result2.length) {
    if ([Contacts.Status.normal, Contacts.Status.blackList].includes(result2[0].status)) return ws.json({action: data.action, message: '他已是您的好友', status: 1017})
    contactId = result2[0].id
    result2[0].status
    await resetContactById(ws, contactId, remark, result2[0].status === Contacts.Status.never ? Contacts.Status.never : Contacts.Status.delete)
  } else {
    const {result: {insertId}} = await addContactByMasterAndSub(ws, to, from, Contacts.Status.delete, remark)
    contactId = insertId
  }
  const {result} = await selectFriendAplByAddUser(ws, to, from)
  let friendAplId: number
  if (!result.length) {
    const {result: {insertId}} = await addFriendApl(ws, contactId, reason)
    friendAplId = insertId
    await updateLastFriendAplId(ws, [from, to], friendAplId)
    user.lastFriendAplId = friendAplId
    await client.set((await client.get(from))!, JSON.stringify(user))
    await updateUser(to, 'lastFriendAplId', friendAplId)
  } else {
    friendAplId = result[0].id
    const status = result[0].status
    // if (status === FriendApls.Status.pending) return ws.json({message: '请勿重复申请', status: 1013})
    if (status === FriendApls.Status.accept) return ws.json({message: '该用户已是您的好友', status: 1014})
    await resetFriendAplById(ws, friendAplId, reason)
  }
  const status = FriendApls.Status.pending
  let {nickname, avatar} = user
  usernameClientMap[to]?.json({action: REC_ADD_USER, data: {friendAplId, contactId, from, reason, nickname, avatar, status}});
  ({nickname, avatar} = users[0])
  ws.json({action: data.action, message: '申请成功', data: {friendAplId, contactId, from, nickname, avatar, reason, status}})
}

export async function addUserRet(ws: ExtWebSocket, user: User, data: RequestMessage<AddUserRetReq>) {
  await checkMessageParams(ws, addUserRetSchema, data.data, 1015)
  const {friendAplId, contactId, to, status, remark} = data.data
  const from = user.username
  const updatedAt = formatDate()
  await beginSocketSql(ws)
  const {result} = await updateFriendAplStatus(ws, friendAplId, contactId, to, from, status, updatedAt)
  if (!result.affectedRows) return ws.json({message: '无申请记录或已修改该记录', status: 1016})
  if (status === FriendApls.Status.accept) { // 接受
    const {result: {affectedRows}} = await updateContactStatus(ws, contactId, from, to, Contacts.Status.normal)
    if (!affectedRows) return ws.json({status: 1019, message: 'contactId不匹配'})
    await addContactByMasterAndSub(ws, to, from, Contacts.Status.normal, remark)
  }
  const message = {
    pre: null,
    content: '你们已成为好友，可以一起尬聊了',
    type: MsgType.system,
    fakeId: createFakeId(from, to),
    to
  } as SgMsgReq
  const {result: {insertId}} = await addSgMsg(ws, from, message, formatDate())
  const res: SgMsgRes = {
    ...message,
    from,
    id: insertId,
    next: null,
    status: MsgStatus.normal,
    read: MsgRead.no
  }
  ws.json({action: data.action, data: {friendAplId, from, status, updatedAt}})
  usernameClientMap[to]?.json({action: REC_ADD_USER_RET, data: {friendAplId, from, to, status, updatedAt}})
  ws.json({action: REC_SG_MSGS, data: res})
  usernameClientMap[to]?.json({action: REC_SG_MSGS, data: res})
}

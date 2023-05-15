import {checkMessageParams, createFakeId, formatDate, handleAudio} from "../../../common/utils";
import {User, Users} from "../../../router/user/user-types";
import {ExtWebSocket, MsgRead, MsgStatus, MsgType, RequestMessage} from "../../socket-types";
import {addGroupRetSchema, addGroupSchema, createGroupSchema, groupInviteRetSchema} from "./group-schema";
import {
  addGpMsg,
  insertGroup,
  insertGroupInvite, insertGroupMember,
  resetGroupApl,
  selectGroupAplByAddGroup,
  selectGroupAplByInvite,
  selectGroupById, selectLastGpMsg,
  selectUserByUsername, updateGpMsgNext,
  updateGroupAplStatus, updateGroupMember
} from "./group-sql";
import {AddGroupReq, AddGroupRetReq, CreateGroupReq, GpMemberOrigin, GpMsgReq, GpMsgRes, Group, GroupApls, GroupInviteRetReq, Groups} from "./group-types";
import client from "../../../redis/redis";
import {usernameClientMap} from "../single/single";
import {REC_ADD_GROUP, REC_GP_MSGS, REC_GROUP_INVITE, REC_SG_MSGS} from "../../socket-actions";
import {beginSocketSql} from "../../../db";
import {addGroupMessage} from "../single/single-sql";

export async function createGroup(ws: ExtWebSocket, session: User, data: RequestMessage<CreateGroupReq>) {
  await checkMessageParams(ws, createGroupSchema, data.data, 1006)
  const from = session.username
  const createdAt = formatDate()
  await beginSocketSql(ws)
  const {result: {insertId}} = await insertGroup(ws, from, data.data, createdAt)
  await insertGroupMember(ws, from, 0, GpMemberOrigin.author)

  const {action, data: {members}} = data
  if (!insertId) return ws.json({action, message: '创建失败', status: 1007})
  const message = {
    pre: null,
    content: '#创建了群聊/' + encodeURIComponent(from),
    type: MsgType.dynamicSys,
    fakeId: createFakeId(from, insertId),
    to: insertId
  } as GpMsgReq
  const {result: {insertId: msgId}} = await addGpMsg(ws, from, message, formatDate())
  const res: GpMsgRes = {
    ...message,
    from,
    id: msgId,
    next: null,
    status: MsgStatus.normal,
    read: MsgRead.no
  }
  for (const username of members) {
    if (!(await selectUserByUsername(ws, username)).result.length) continue
    const {result: {insertId: groupId}} = await insertGroupInvite(ws, insertId, from, username)
    usernameClientMap[username]?.json({action: REC_GROUP_INVITE, data: {id: insertId, groupId, from, status: GroupApls.Status.pending, createdAt}})
  }
  ws.json({action, data: {id: insertId, from, createdAt}})
  ws.json({action: REC_GP_MSGS, data: res})
}

export async function groupInviteRet(ws: ExtWebSocket, session: User, data: RequestMessage<GroupInviteRetReq>) {
  await checkMessageParams(ws, groupInviteRetSchema, data.data, 1008)
  const {action, data: {id: groupAplId, status}} = data
  const from = session.username
  const {result} = await selectGroupAplByInvite(ws, from, groupAplId)
  if (!result.length) return ws.json({action, message: '无邀请记录', status: 1009})
  if (result[0].status !== GroupApls.Status.pending) return ws.json({action, message: '记录已被修改', status: 1010})
  await beginSocketSql(ws)
  await updateGroupAplStatus(ws, groupAplId, status)
  const [{to}] = result
  const group = await getGroupById(ws, to)
  group.members.add(from)
  group.member = Array.from(group.members).join(',')
  await updateGroupMember(ws, to, group.member)
  await saveGroup(to, group)
  ws.json({action, data: data.data})
  if (status === GroupApls.Status.accept) { // 通知入群
    const message = {
      pre: null,
      content: '#加入了群聊/' + encodeURIComponent(from),
      type: MsgType.dynamicSys,
      fakeId: createFakeId(from, to),
      to
    } as GpMsgReq
    const {result: {insertId}} = await addGpMsg(ws, from, message, formatDate())
    const {result: [{id}]} = await selectLastGpMsg(ws, null, from, to)
    await updateGpMsgNext(ws, insertId, id)
    for (const member of group.members) {
      usernameClientMap[member]?.json({action: REC_SG_MSGS, data: {from}})
    }
  }
}

export async function getGroupById(ws: ExtWebSocket, id: Groups.Id): Promise<Group> {
  const _group = await client.get('group-' + id)
  let group: Group
  if (_group) {
    group = JSON.parse(_group)
  } else {
    const {result} = await selectGroupById(ws, id)
    if (!result.length) {
      ws.json({status: 1004, message: '未知的群聊id：' + id})
      return Promise.reject()
    }
    group = result[0]
  }
  group.managers = group.manager ? new Set(group.manager.split(',')) : new Set()
  group.members = group.member ? new Set(group.member.split(',')) : new Set()
  await saveGroup(id, group)
  return group
}

export async function saveGroup(id: Groups.Id, group: Group) {
  const _group: Partial<Group> = {...group}
  delete _group.members
  delete _group.managers
  await client.set('group-' + id, JSON.stringify(_group))
}

export function isUserInGroup(username: Users.Username, group: Group) {
  return username === group.leader || group.managers.has(username) || group.members.has(username)
}

export async function addGroup(ws: ExtWebSocket, session: User, data: RequestMessage<AddGroupReq>) {
  await checkMessageParams(ws, addGroupSchema, data.data, 1001)
  const {id: to, reason} = data.data
  const group = await getGroupById(ws, to)
  if (isUserInGroup(session.username, group)) return ws.json({message: '你已在群里', status: 1002})
  const {username: from, nickname, avatar} = session
  const {result} = await selectGroupAplByAddGroup(ws, to, from)
  await beginSocketSql(ws)
  if (result.length) {
    const status = result[0].status
    if (status === GroupApls.Status.pending) return ws.json({message: '请勿重复申请', status: 1003})
    // if (status === GroupApls.Status.accept) return ws.json({message: '你已在群里', status: 1004})
    await resetGroupApl(ws, to, from, reason)
  } else {
    // await addFriendApl(ws, to, from, reason)
  }
  ws.json({message: '申请成功', action: data.action, data: {from}})
  const res = JSON.stringify({action: REC_ADD_GROUP, data: {from, nickname, avatar}})
  usernameClientMap[group.leader]?.send(res)
  group.managers.forEach(manager => usernameClientMap[manager]?.send(res))
}

export async function addGroupRet(ws: ExtWebSocket, session: User, data: RequestMessage<AddGroupRetReq>) {
  await checkMessageParams(ws, addGroupRetSchema, 1005)
  const body = data.data
  const {to, status} = body
  const from = session.username

}

async function groupChat(ws: ExtWebSocket, message: GpMsgReq, session: User) { // 群聊
  const group = await getGroupById(ws, message.to)
  const {username} = session
  if (!isUserInGroup(username, group)) return ws.json({status: 1006, message: '您不在群内'})
  const createdAt = formatDate()
  if (message.type === MsgType.audio) handleAudio(message, createdAt) // 音频
  const data = {
    data: [{data: message.content, type: message.type, fakeId: message.fakeId, from: session.username, to: message.to, createdAt}],
    action: REC_SG_MSGS
  }
  await addGroupMessage(message)
  usernameClientMap[group.leader]?.json(data)
  group.managers.forEach(manager => usernameClientMap[manager]?.json(data))
  group.members.forEach(member => usernameClientMap[member]?.json(data))
}

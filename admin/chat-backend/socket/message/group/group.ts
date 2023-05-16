import {checkMessageParams, createFakeId, formatDate, handleAudio, notifyUpdateUser} from "../../../common/utils";
import {User, Users} from "../../../router/user/user-types";
import {ExtWebSocket, MsgStatus, MsgType, RequestMessage} from "../../socket-types";
import {addGroupRetSchema, addGroupSchema, createGroupSchema, getGroupAplsSchema, groupInviteRetSchema, readGpMsgsSchema} from "./group-schema";
import {
  addGpMsg,
  addGroup,
  addGroupApl,
  addGroupMember,
  resetGroupApl, selectGpMsgReadsById,
  selectGroupAplByAddGroup,
  selectGroupAplByInvite, selectGroupAplsById,
  selectGroupById,
  selectLastGpMsg,
  selectUserByUsername,
  updateGpMsgNext, updateGpMsgReads,
  updateGroupAplStatus,
  updateGroupsMember
} from "./group-sql";
import {
  AddGroupReq,
  AddGroupRetReq,
  CreateGroupReq, GetGroupAplsReq,
  GpMemberOrigin,
  GpMsgReq,
  GpMsgRes,
  Group,
  GroupApls,
  GroupInviteRetReq,
  GroupInviteRetRes,
  Groups, ReadGpMsgsReq
} from "./group-types";
import client from "../../../redis/redis";
import {usernameClientMap} from "../single/single";
import {REC_ADD_GROUP, REC_GP_MSGS, REC_GROUP_INVITE, REC_GROUP_INVITE_RET, REC_READ_GP_MSGS, REC_SG_MSGS} from "../../socket-actions";
import {beginSocketSql} from "../../../db";
import {addGroupMessage} from "../single/single-sql";

// 创建群聊
export async function createGroup(ws: ExtWebSocket, user: User, data: RequestMessage<CreateGroupReq>) {
  await checkMessageParams(ws, createGroupSchema, data.data, 1006)
  const from = user.username
  const createdAt = formatDate()
  await beginSocketSql(ws)
  const {result: {insertId: groupId}} = await addGroup(ws, from, data.data, createdAt)
  await addGroupMember(ws, from, groupId, 0, GpMemberOrigin.author, null, null)
  const {action, data: {members}} = data
  if (!groupId) return ws.json({action, message: '创建失败', status: 1007})
  const message = {
    pre: null,
    content: '#创建了群聊/' + encodeURIComponent(from),
    type: MsgType.dynamicSys,
    fakeId: createFakeId(from, groupId),
    to: groupId
  } as GpMsgReq
  const {result: {insertId: msgId}} = await addGpMsg(ws, from, message, formatDate(), '')
  const res: GpMsgRes = {
    ...message,
    from,
    id: msgId,
    next: null,
    status: MsgStatus.normal,
    reads: ''
  }
  for (const username of members) {
    if (!(await selectUserByUsername(ws, username)).result.length) continue
    const {result: {insertId: groupAplId}} = await addGroupApl(ws, groupId, from, username, null)
    usernameClientMap[username]?.json({action: REC_GROUP_INVITE, data: {id: groupAplId, groupId, from, status: GroupApls.Status.pending, createdAt}})
    const sessionId = await client.get(username)
    if (sessionId) {
      const toUser: User = JSON.parse((await client.get(sessionId))!)
      toUser.lastGroupAplId = groupAplId
      await client.set(sessionId, JSON.stringify(toUser))
    }
    notifyUpdateUser(username)
  }
  ws.json({action, data: {id: groupId, from, createdAt}})
  ws.json({action: REC_GP_MSGS, data: res})
}

// 群邀请回应
export async function groupInviteRet(ws: ExtWebSocket, user: User, data: RequestMessage<GroupInviteRetReq>) {
  await checkMessageParams(ws, groupInviteRetSchema, data.data, 1008)
  const {action, data: {id: groupAplId, status}} = data
  const from = user.username
  const {result} = await selectGroupAplByInvite(ws, from, groupAplId)
  if (!result.length) return ws.json({action, message: '无邀请记录', status: 1009})
  if (result[0].status !== GroupApls.Status.pending) return ws.json({action, message: '记录已被修改', status: 1010})
  await beginSocketSql(ws)
  await updateGroupAplStatus(ws, groupAplId, status)
  const [{groupId, inviter}] = result
  const createdAt = formatDate()
  const res: GroupInviteRetRes = {...data.data, createdAt}
  if (status === GroupApls.Status.accept) { // 通知入群
    const group = await getGroupById(ws, groupId)
    group.members.add(from)
    group.member = Array.from(group.members).join(',')
    await updateGroupsMember(ws, groupId, group.member)
    await saveGroup(groupId, group)
    await addGroupMember(ws, from, groupId, 0, GpMemberOrigin.invitee, group.leader, null)
    ws.json({action, data: res})
    const {result: [{id}]} = await selectLastGpMsg(ws, null, groupId)
    const message = {
      pre: id,
      content: '#加入了群聊/' + encodeURIComponent(from),
      type: MsgType.dynamicSys,
      fakeId: createFakeId(from, groupId),
      to: groupId
    } as GpMsgReq
    const {result: {insertId}} = await addGpMsg(ws, from, message, createdAt, '')
    await updateGpMsgNext(ws, insertId, id)
    const msgRes = JSON.stringify({
      action: REC_GP_MSGS,
      data: {
        ...message,
        id: insertId,
        next: null,
        status: MsgStatus.normal,
        from,
        createdAt,
        reads: ''
      }
    })
    for (const member of group.members) usernameClientMap[member]?.send(msgRes)
  } else {
    ws.json({action, data: res})
    usernameClientMap[inviter]?.json({action: REC_GROUP_INVITE_RET, data: res})
  }
}

// 获取群申请列表
export async function getGroupApls(ws: ExtWebSocket, user: User, data: RequestMessage<GetGroupAplsReq>) {
  await checkMessageParams(ws, getGroupAplsSchema, data.data, 1012)
  const {result} = await selectGroupAplsById(ws, user.username, data.data.lastGroupAplId, user.lastGroupAplId)
  ws.json({action: data.action, data: result.reverse(), message: '查询成功'})
}

// 消息已读
export async function readGpMsgs(ws: ExtWebSocket, user: User, data: RequestMessage<ReadGpMsgsReq>) {
  await checkMessageParams(ws, readGpMsgsSchema, data.data, 1013)
  const from = user.username
  const {action, data: {ids, to}} = data
  const group = await getGroupById(ws, to)
  if (!isUserInGroup(from, group)) return ws.json({action, message: '你不在群内', status: 1014})
  let count = 0
  for (const id of ids) {
    const {result} = await selectGpMsgReadsById(ws, id)
    if (!result.length) continue
    const reads: string[] = result[0].reads.split(',')
    reads.push(from)
    await updateGpMsgReads(ws, data.data.to, reads.join(','))
    count++
  }
  groupBroad(group, JSON.stringify({action: REC_READ_GP_MSGS, data: {ids, count, from}}))
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

// 申请加群
export async function joinGroup(ws: ExtWebSocket, user: User, data: RequestMessage<AddGroupReq>) {
  await checkMessageParams(ws, addGroupSchema, data.data, 1001)
  const {id: to, reason} = data.data
  const group = await getGroupById(ws, to)
  if (isUserInGroup(user.username, group)) return ws.json({message: '你已在群里', status: 1002})
  const {username: from, nickname, avatar} = user
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

// 加群申请回应
export async function joinGroupRet(ws: ExtWebSocket, session: User, data: RequestMessage<AddGroupRetReq>) {
  await checkMessageParams(ws, addGroupRetSchema, 1005)
  const body = data.data
  const {to, status} = body
  const from = session.username

}

// 群广播
function groupBroad(group: Group, data: string) {
  usernameClientMap[group.leader]?.send(data)
  group.managers.forEach(manager => usernameClientMap[manager]?.send(data))
  group.members.forEach(member => usernameClientMap[member]?.send(data))
}

// 群聊
async function groupChat(ws: ExtWebSocket, message: GpMsgReq, user: User) { // 群聊
  const group = await getGroupById(ws, message.to)
  const {username} = user
  if (!isUserInGroup(username, group)) return ws.json({status: 1006, message: '您不在群内'})
  const createdAt = formatDate()
  if (message.type === MsgType.audio) handleAudio(message, createdAt) // 音频
  const res = JSON.stringify({
    data: [{data: message.content, type: message.type, fakeId: message.fakeId, from: user.username, to: message.to, createdAt}],
    action: REC_SG_MSGS
  })
  await addGroupMessage(message)
  groupBroad(group, res)
}

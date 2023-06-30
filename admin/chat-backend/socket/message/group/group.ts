import {checkChatLog, checkMessageParams, createFakeId, formatDate, handleAudio, updateUser} from '../../../common/utils'
import {User, Users} from '../../../router/user/user-types'
import {ExtWebSocket, MsgStatus, MsgType, RequestMessage, SysMsgCont, SysMsgContType} from '../../socket-types'
import {
  addGroupRetSchema,
  addGroupSchema,
  createGroupSchema,
  getGpMsgByIdsSchema,
  getGroupAplsSchema,
  getGroupInfoSchema,
  getGroupMembersSchema,
  getHisGpMsgsSchema,
  groupInviteRetSchema,
  groupInviteSchema,
  readGpMsgsSchema, replyGpContSchema,
  sendGpMsgSchema,
  transmitGpMsgsSchema
} from './group-schema'
import {
  addGpMsg,
  addGroup,
  addGroupApl,
  addGroupMember,
  resetGroupApl,
  selectGpMsgByFakeId,
  selectGpMsgById,
  selectGpMsgByIdAndFrom,
  selectGpMsgReadsById,
  selectGroupAplByAddGroup,
  selectGroupAplByInvite,
  selectGroupAplsById,
  selectGroupById,
  selectGroupInfo,
  selectHisGpMsgs,
  selectLastGpMsg,
  selectNewGpMsgs,
  selectUserByUsername,
  updateGpMsgNext,
  updateGpMsgReads,
  updateGpMsgStatus,
  updateGroupAplStatus,
  updateGroupsMember
} from './group-sql'
import {
  AddGroupReq,
  AddGroupRetReq,
  CreateGroupReq,
  GetGpMsgByIdsReq,
  GetGroupsRes,
  GetHisGpMsgReq,
  GpMemberOrigin,
  GpMsgRes,
  GpMsgs,
  Group,
  GroupApls,
  GroupInviteReq,
  GroupInviteRetReq,
  GroupInviteRetRes,
  Groups,
  ReadGpMsgsReq,
  SendGpMsgReq,
  TransmitGpMsgsReq
} from './group-types'
import client from '../../../redis/redis'
import {usernameClientMap} from '../single/single'
import {REC_ADD_GROUP, REC_GP_MSGS, REC_GROUP_INVITE, REC_GROUP_INVITE_RET, REC_READ_GP_MSGS} from '../../socket-actions'
import {beginSocketSql, commitSocketSql} from '../../../db'
import {addUserGroups, selectUserGroups} from '../user/user-sql'
import {ChatLog, PageQuery} from '../common/common-types'
import {ReplyContent} from "../single/single-types";

// 创建群聊
export async function createGroup(ws: ExtWebSocket, user: User, data: RequestMessage<CreateGroupReq>) {
  await checkMessageParams(ws, createGroupSchema, data.data, 1006)
  const from = user.username
  const createdAt = formatDate()
  await beginSocketSql(ws)
  const {result: {insertId: groupId}} = await addGroup(ws, from, data.data, createdAt)
  await addUserGroups(ws, from, groupId)
  await addGroupMember(ws, from, groupId, 0, GpMemberOrigin.author, null, null)
  const {action, data: {members}} = data
  if (!groupId) return ws.json({action, message: '创建失败', status: 1007})
  const message = {
    pre: null,
    content: [{type: SysMsgContType.username, value: from}, {type: SysMsgContType.text, value: '创建了群聊'}] as SysMsgCont[],
    type: MsgType.dynamicSys,
    fakeId: createFakeId(from, groupId),
    to: groupId
  } as SendGpMsgReq
  const {result: {insertId: msgId}} = await addGpMsg(ws, from, message, formatDate(), '')
  const res: GpMsgRes = {
    ...message,
    from,
    id: msgId,
    next: null,
    status: MsgStatus.normal,
    readCount: 0,
    createdAt
  }
  await broadGroupInvite(ws, members, groupId, from, createdAt)
  await commitSocketSql(ws)
  ws.json({action, data: {id: groupId, from, createdAt}})
  ws.json({action: REC_GP_MSGS, data: [res]})
}

// 查询群列表
export async function getGroups(ws: ExtWebSocket, user: User, data: RequestMessage) {
  const {result} = await selectUserGroups(ws, user.username)
  if (!result.length) return ws.json({action: data.action, data: []})
  const groups = result[0].groups ? result[0].groups.split(',') : []
  const res: GetGroupsRes[] = []
  for (const group of groups) {
    const {result} = await selectGroupInfo(ws, group)
    result.length && res.push(result[0])
  }
  ws.json({action: data.action, data: res})
}

// 邀请入群
export async function groupInvite(ws: ExtWebSocket, user: User, data: RequestMessage<GroupInviteReq>) {
  await checkMessageParams(ws, groupInviteSchema, data.data, 1019)
  const {action, data: {members, to}} = data
  const group = await getGroupById(ws, to)
  const from = user.username
  if (!isUserInGroup(from, group)) return ws.json({action, message: '你不在群内', status: 1020})
  await beginSocketSql(ws)
  const groupId = group.id
  const createdAt = formatDate()
  for (let i = 0, l = members.length; i < l; i++) {
    if (isUserInGroup(members[i], group)) delete members[i]
  }
  await broadGroupInvite(ws, members, groupId, from, createdAt)
  ws.json({action, data: {to, members: members.filter(() => true)}})
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
    if (isUserInGroup(from, group)) return ws.json({action, message: '你已在群内', status: 1011})
    group.members.add(from)
    group.member = Array.from(group.members).join(',')
    await updateGroupsMember(ws, groupId, group.member)
    await addUserGroups(ws, from, groupId)
    await saveGroup(groupId, group)
    await addGroupMember(ws, from, groupId, 0, GpMemberOrigin.invitee, group.leader, null)
    ws.json({action, data: res})
    const {result: [{id}]} = await selectLastGpMsg(ws, null, groupId)
    const message = {
      pre: id,
      content: [{type: SysMsgContType.username, value: from}, {type: SysMsgContType.text, value: '加入了群聊'}] as SysMsgCont[],
      type: MsgType.dynamicSys,
      fakeId: createFakeId(from, groupId),
      to: groupId
    } as SendGpMsgReq
    const {result: {insertId}} = await addGpMsg(ws, from, message, createdAt, '')
    await updateGpMsgNext(ws, insertId, id)
    const msgRes: RequestMessage<GpMsgRes> = {
      action: REC_GP_MSGS,
      data: {
        ...message,
        id: insertId,
        next: null,
        status: MsgStatus.normal,
        from,
        createdAt,
        readCount: 0
      }
    }
    broadGpMsg(group, JSON.stringify(msgRes))
  } else {
    ws.json({action, data: res})
    usernameClientMap[inviter]?.json({action: REC_GROUP_INVITE_RET, data: res})
  }
}

// 获取群申请列表
export async function getGroupApls(ws: ExtWebSocket, user: User, data: RequestMessage<PageQuery>) {
  await checkMessageParams(ws, getGroupAplsSchema, data.data, 1012)
  const {result} = await selectGroupAplsById(ws, user.username, data.data)
  ws.json({action: data.action, data: result.reverse(), message: '查询成功'})
}

// 消息已读
export async function readGpMsgs(ws: ExtWebSocket, user: User, data: RequestMessage<ReadGpMsgsReq>) {
  await checkMessageParams(ws, readGpMsgsSchema, data.data, 1013)
  const from = user.username
  const {action, data: {ids, to}} = data
  const group = await getGroupById(ws, to)
  if (!isUserInGroup(from, group)) return ws.json({action, message: '你不在群内', status: 1014})
  await beginSocketSql(ws)
  const readIds: GpMsgs.Id[] = []
  for (const id of ids) {
    const {result} = await selectGpMsgReadsById(ws, id, to)
    if (!result.length) continue
    const reads: string[] = result[0].reads ? result[0].reads.split(',') : []
    if (reads.includes(from)) continue
    reads.push(from)
    await updateGpMsgReads(ws, id, to, reads.join(','))
    readIds.push(id)
  }
  broadGpMsg(group, JSON.stringify({action: REC_READ_GP_MSGS, data: {ids: readIds, to}}))
}

async function getGroupById(ws: ExtWebSocket, id: Groups.Id): Promise<Group> {
  const _group = await client.get('group-' + id)
  let group: Group
  if (_group) {
    group = JSON.parse(_group)
  } else {
    const {result} = await selectGroupById(ws, id)
    if (!result.length) {
      ws.json({status: 1004, message: '未知的群聊id：' + id})
      return Promise.reject('未知的群聊id：' + id)
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
export async function joinGroupRet(ws: ExtWebSocket, user: User, data: RequestMessage<AddGroupRetReq>) {
  await checkMessageParams(ws, addGroupRetSchema, 1005)
  const body = data.data
  const {to, status} = body
  const from = user.username

}

// 群聊
export async function sendGpMsg(ws: ExtWebSocket, user: User, data: RequestMessage<SendGpMsgReq>) {
  const {action, data: body} = data
  await checkMessageParams(ws, sendGpMsgSchema, body, 1007)
  const {to, type, fakeId, status} = body
  const group = await getGroupById(ws, to)
  const from = user.username
  if (!isUserInGroup(from, group)) return ws.json({action, status: 1006, message: '您不在群内'})
  const {result} = await selectGpMsgByFakeId(ws, fakeId)
  if (result.length) return ws.json({action, status: 1008, message: 'fakeId重复'})
  const {result: result2} = await selectLastGpMsg(ws, body.lastId!, to)
  if (!result2.length) return ws.json({action, status: 1009, message: 'lastId错误'})
  await beginSocketSql(ws)
  const createdAt = formatDate()
  if (status === MsgStatus.reply) await handleReply(ws, body)
  if (type === MsgType.audio) handleAudio(body, createdAt) // 音频
  else if (type === MsgType.retract) await handleRetract(ws, body, from)
  else if (type === MsgType.chatLogs) await checkChatLog(ws, body.content as unknown as ChatLog)
  let lastMsg = result2[0]
  const messages: GpMsgRes[] = JSON.parse((await selectNewGpMsgs(ws, lastMsg.id)).result[0][0].messages)
  if (messages.length > 0) lastMsg = messages[messages.length - 1]
  body.pre = lastMsg.id
  const {result: {insertId}} = await addGpMsg(ws, from, body, createdAt, '')
  await updateGpMsgNext(ws, insertId, lastMsg.id)
  const message: GpMsgRes = {
    id: insertId,
    pre: body.pre,
    next: null,
    status: MsgStatus.normal,
    content: body.content,
    type,
    fakeId,
    from,
    to,
    createdAt,
    readCount: 0
  }
  messages.push(message)
  ws.json({action: REC_GP_MSGS, data: messages})
  broadGpMsg(group, JSON.stringify({action: REC_GP_MSGS, data: [message]}), from)
}

// 逐条转发群消息
export async function transmitGpMsgs(ws: ExtWebSocket, user: User, data: RequestMessage<TransmitGpMsgsReq>) {
  const {action, data: body} = data
  await checkMessageParams(ws, transmitGpMsgsSchema, body, 1007)
  console.log(action, data)
  const {to, lastId, msgs} = body
  const group = await getGroupById(ws, to)
  const from = user.username
  if (!isUserInGroup(from, group)) return ws.json({action, status: 1006, message: '您不在群内'})
  const {result: result2} = await selectLastGpMsg(ws, lastId!, to)
  if (!result2.length) return ws.json({action, status: 1009, message: 'lastId错误'})
  let lastMsg = result2[0]
  const messages: GpMsgRes[] = JSON.parse((await selectNewGpMsgs(ws, lastMsg.id)).result[0][0].messages)
  if (messages.length > 0) lastMsg = messages[messages.length - 1]
  await beginSocketSql(ws)
  let fakeIdRepeat = false
  let pre: GpMsgs.Pre
  const newMsgs: GpMsgRes[] = []
  let i = 0
  for (const msg of msgs) {
    const {fakeId, content, type} = msg
    const {result} = await selectGpMsgByFakeId(ws, fakeId)
    if (result.length) {
      fakeIdRepeat = true
      ws.json({action, status: 1008, message: 'fakeId重复'})
      break
    }
    const createdAt = formatDate()
    msg.pre = lastMsg.id;
    (msg as SendGpMsgReq).to = to
    const {result: {insertId}} = await addGpMsg(ws, from, msg as SendGpMsgReq, createdAt, '')
    await updateGpMsgNext(ws, insertId, lastMsg.id)
    if ((i++ === 0 && messages.length > 0) || i > 0) lastMsg.next = insertId
    const message: GpMsgRes = {
      id: insertId,
      pre: msg.pre,
      next: null,
      status: MsgStatus.normal,
      content,
      type,
      fakeId,
      from,
      to,
      createdAt,
      readCount: 0
    }
    newMsgs.push(message)
    lastMsg = message
  }
  if (fakeIdRepeat) return Promise.reject('群聊：fakeId重复')
  ws.json({action: REC_GP_MSGS, data: messages.concat(newMsgs)})
  broadGpMsg(group, JSON.stringify({action: REC_GP_MSGS, data: newMsgs}), from)
}

// 历史消息
export async function getHisGpMsgs(ws: ExtWebSocket, user: User, data: RequestMessage<GetHisGpMsgReq>) {
  await checkMessageParams(ws, getHisGpMsgsSchema, data.data, 1001)
  const {result} = await selectHisGpMsgs(ws, data.data)
  ws.json({action: data.action, data: JSON.parse(result[0][0].messages)})
}

// 获取群信息
export async function getGroupInfo(ws: ExtWebSocket, user: User, data: RequestMessage<{ id: Groups.Id }>) {
  await checkMessageParams(ws, getGroupInfoSchema, data.data, 1001)
  const {id, name, avatar, leader, manager, managers, members} = await getGroupById(ws, data.data.id)
  ws.json({action: data.action, data: {id, name, avatar, leader, manager, count: 1 + managers.size + members.size}})
}

// 获取群成员
export async function getGroupMembers(ws: ExtWebSocket, user: User, data: RequestMessage<{ id: Groups.Id }>) {
  await checkMessageParams(ws, getGroupMembersSchema, data.data, 1001)
  const {member} = await getGroupById(ws, data.data.id)
  ws.json({action: data.action, data: member})
}

// 根据id列表获取消息
export async function getGpMsgsByIds(ws: ExtWebSocket, user: User, data: RequestMessage<GetGpMsgByIdsReq>) {
  const {action, data: body} = data
  await checkMessageParams(ws, getGpMsgByIdsSchema, body, 1001)
  const res: GpMsgRes[] = []
  for (const id of body.data) {
    const {result} = await selectGpMsgById(ws, id)
    if (!result.length) return ws.json({action, message: '消息' + id + '不存在', status: 1002})
    res.push(result[0])
  }
  ws.json({action, data: {data: res, fakeId: body.fakeId}})
}

// 处理撤回
async function handleRetract(ws: ExtWebSocket, message: SendGpMsgReq, from: GpMsgs.From) {
  const handler = async () => {
    const id = message.content as number
    const {result} = await selectGpMsgByIdAndFrom(ws, id, from)
    if (!result.length) return ws.json({message: 'content不匹配', status: 1010})
    const {createdAt, status} = result[0]
    if (status === MsgStatus.retract) return ws.json({message: '该消息已撤回', status: 1011})
    if (Date.now() - new Date(createdAt).getTime() > 120000) return ws.json({message: '超过2分钟无法撤回', status: 1012})
    const {result: result2} = await updateGpMsgStatus(ws, id, MsgStatus.retract)
    if (result2.changedRows === 0) return ws.json({message: '撤回失败', status: 1013})
    return true
  }
  if (await handler() !== true) return Promise.reject('撤回群消息异常')
}

// 处理回复
async function handleReply(ws: ExtWebSocket, message: SendGpMsgReq) {
  const handler = async () => {
    await checkMessageParams(ws, replyGpContSchema, message.content, 1012)
    const {id} = message.content as unknown as ReplyContent
    const {result: targetMsgs} = await selectGpMsgById(ws, id, true)
    if (!targetMsgs.length) return ws.json({message: '消息' + id + '不存在', status: 1013})
    return true
  }
  if (await handler() !== true) return Promise.reject('回复消息异常')
}

// 广播群消息
function broadGpMsg(group: Group, data: string, self?: Users.Username) {
  const usernames = [group.leader, ...Array.from(group.managers), ...Array.from(group.members)]
  self && (usernames[usernames.indexOf(self)] = '')
  for (const username of usernames) usernameClientMap[username]?.send(data)
}

// 广播群邀请
async function broadGroupInvite(ws: ExtWebSocket, members: Users.Username[], groupId: Groups.Id, from: Users.Username, createdAt: GroupApls.CreatedAt) {
  for (const username of members) {
    if (!username || !(await selectUserByUsername(ws, username)).result.length) continue
    const {result: {insertId: groupAplId}} = await addGroupApl(ws, groupId, from, username, null)
    usernameClientMap[username]?.json({action: REC_GROUP_INVITE, data: {id: groupAplId, groupId, from, status: GroupApls.Status.pending, createdAt}})
    // await updateUser(username, 'lastGroupAplId', groupAplId)
  }
}
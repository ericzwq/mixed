import {executeSocketSql, getLimitSql} from '../../../db'
import {ExtWebSocket, MsgStatus} from '../../socket-types'
import {Users} from '../../../router/user/user-types'
import {CreateGroupReq, GetGroupsRes, GetHisGpMsgReq, GpMemberOrigin, GpMembers, SendGpMsgReq, GpMsgRes, GpMsgs, Group, GroupApls, Groups} from './group-types'
import {InsertModal, UpdateModal} from '../../../types/sql-types'
import c = require('koa-session/lib/context')
import {GetHisSgMsgReq, SgMsgs} from '../single/single-types'
import exp = require('constants')
import {PageQuery} from "../common/common-types";

export function addGroup(ws: ExtWebSocket, from: Users.Username, data: CreateGroupReq, createdAt: Groups.CreatedAt) {
  const {name, avatar} = data
  return executeSocketSql<InsertModal>(ws, 'insert into `groups`(name, avatar, leader, createdAt) values(?, ?, ?, ?);',
    [name, avatar || '/avatar/group-default.png', from, createdAt])
}

export function addGroupMember(ws: ExtWebSocket, from: Users.Username, groupId: Groups.Id, prohibition: GpMembers.prohibition,
                               origin: GpMemberOrigin, inviter: Users.Username | null, checker: Users.Username | null) {
  return executeSocketSql<InsertModal>(ws, 'insert into group_member(groupId, username, prohibition, origin, inviter, checker) values (?, ?, ?, ?, ?, ?);',
    [groupId, from, prohibition, origin, inviter, checker])
}

export function selectGroupInfo(ws: ExtWebSocket, groupId: string | Groups.Id) {
  return executeSocketSql<GetGroupsRes[]>(ws, 'select id, name, avatar from `groups` where id = ?;', [groupId])
}

export function addGpMsg(ws: ExtWebSocket, from: Users.Username, data: SendGpMsgReq, createdAt: Groups.CreatedAt, reads: GpMsgs.Reads) {
  const {fakeId, content, type, to, pre} = data
  return executeSocketSql<InsertModal>(ws, 'insert into group_chat(fakeId, pre, `from`, `to`, content, type, status, createdAt, `reads`) values(?, ?, ?, ?, ?, ?, ?, ?, ?);',
    [fakeId, pre, from, to, typeof content !== 'string' ? JSON.stringify(content) : content, type, MsgStatus.normal, createdAt, reads])
}

export function selectGpMsgByFakeId(ws: ExtWebSocket, fakeId: GpMsgs.FakeId) {
  return executeSocketSql<[]>(ws, 'select 1 from group_chat where fakeId = ?;', [fakeId])
}

// 根据lastId获取当前客户端最后一条消息
export function selectLastGpMsg(ws: ExtWebSocket, lastId: GpMsgs.Id | null, groupId: Groups.Id) {
  if (lastId != null) {
    return executeSocketSql<GpMsgRes[]>(ws,
      'select * from group_chat where id = ?;', [lastId])
  } else {
    return executeSocketSql<GpMsgRes[]>(ws,
      'select * from group_chat where `to` = ? and next is null;', [groupId])
  }
}

export function selectNewGpMsgs(ws: ExtWebSocket, preId: GpMsgs.Pre, count = 20) {
  return executeSocketSql<[[{ messages: string }]]>(ws, 'call selectNewGpMsgs(?, ?);', [preId, count])
}

export function updateGpMsgNext(ws: ExtWebSocket, next: GpMsgs.Next, id: GpMsgs.Id) {
  return executeSocketSql(ws,
    'update group_chat set next = ? where id = ?;', [next, id])
}

export function selectUserByUsername(ws: ExtWebSocket, username: Users.Username) {
  return executeSocketSql<[]>(ws, 'select 1 from users where username = ?;', [username])
}

export function addGroupApl(ws: ExtWebSocket, groupId: GroupApls.Id, from: Users.Username, to: Users.Username, reason: GroupApls.Reason | null) {
  return executeSocketSql<InsertModal>(ws, 'insert into group_applications(groupId, `from`, invitee, type, status, reason) values(?, ?, ?, ?, ?, ?);',
    [groupId, from, to, GroupApls.Type.passive, GroupApls.Status.pending, reason])
}

export function selectGroupById(ws: ExtWebSocket, id: Groups.Id) {
  return executeSocketSql<Group[]>(ws, 'select * from `groups` where id = ?;', [id])
}

export function selectGroupAplByAddGroup(ws: ExtWebSocket, groupId: GroupApls.Id, from: Users.Username) {
  return executeSocketSql<{ status: GroupApls.Status }[]>(ws,
    'select status from group_applications where `from` = ? and  groupId = ?;', [from, groupId])
}

export function selectGroupAplByInvite(ws: ExtWebSocket, from: Users.Username, groupAplId: GroupApls.Id) {
  return executeSocketSql<{ status: GroupApls.Status, groupId: Groups.Id, inviter: GroupApls.From }[]>(ws,
    'select status, groupId, `from` inviter from group_applications where id = ? and invitee = ? and type = ?;', [groupAplId, from, GroupApls.Type.passive])
}

export function updateGroupAplStatus(ws: ExtWebSocket, id: GroupApls.Id, status: GroupApls.Status) {
  return executeSocketSql<UpdateModal>(ws, 'update group_applications set status = ? where id = ?;', [status, id])
}

export function updateGroupsMember(ws: ExtWebSocket, id: Groups.Id, member: Groups.Member) {
  return executeSocketSql<UpdateModal>(ws, 'update `groups` set member = ? where id = ?;', [member, id])
}

export function resetGroupApl(ws: ExtWebSocket, groupId: GroupApls.Id, from: Users.Username, reason: GroupApls.Reason) {
  return executeSocketSql<UpdateModal>(ws, 'update group_applications set reason = ? where `from` = ? and groupId = ?;', [reason, from, groupId])
}

export function selectGroupAplsById(ws: ExtWebSocket, from: Users.Username, data: PageQuery) {
  return executeSocketSql(ws, `select *
                               from group_applications
                               where (\`from\` = ? and type = ?)
                                  or invitee = ? ${getLimitSql(data)};`,
    [from, GroupApls.Type.active, from])
}

export function selectGpMsgReadsById(ws: ExtWebSocket, id: GpMsgs.Id, to: GpMsgs.To) {
  return executeSocketSql<{ reads: GpMsgs.Reads }[]>(ws, 'select `reads` from group_chat where id = ? and `to` = ?;', [id, to])
}

export function updateGpMsgReads(ws: ExtWebSocket, id: GpMsgs.Id, to: GpMsgs.To, reads: GpMsgs.Reads) {
  return executeSocketSql<UpdateModal>(ws, 'update group_chat set `reads` = ?, readCount = readCount + 1 where id = ? and `to` = ?;', [reads, id, to])
}

export function selectGpMsgByIdAndFrom(ws: ExtWebSocket, id: GpMsgs.Id, from: GpMsgs.From) {
  return executeSocketSql<{ createdAt: GpMsgs.CreatedAt, status: MsgStatus }[]>(ws,
    'select `to`, createdAt, status from group_chat where id = ? and `from` = ?;', [id, from])
}

export function updateGpMsgStatus(ws: ExtWebSocket, id: GpMsgs.Id, status: MsgStatus) {
  return executeSocketSql<UpdateModal>(ws, 'update group_chat set status = ? where id = ?', [status, id])
}

export function selectHisGpMsgs(ws: ExtWebSocket, data: GetHisGpMsgReq) {
  const {maxId, count, minId} = data
  return executeSocketSql<[[{ messages: string }]]>(ws, `call selectHisGpMsgs(?, ?, ?);`, [maxId, count, minId])
}

// 根据id获取消息
export function selectGpMsgById(ws: ExtWebSocket, id: GpMsgs.Id, simple = false) {
  const join = simple ? 'count(1)' : '*'
  return executeSocketSql<GpMsgRes[]>(ws, 'select ' + join + ' from group_chat where id = ?;', [id])
}

// export function addGroupApl(ws: ExtWebSocket, to: GroupApls.Id, from: Users.Username, reason: GroupApls.Reason) {
//   return executeSocketSql<InsertModal>(ws, 'insert into group_applications(`from`, invitee, reason, status) values(?, ?, ?, ?);', [from, to, reason, Status.pending])
// }

import {executeSocketSql} from "../../../db";
import {ExtWebSocket, MsgStatus} from "../../socket-types";
import {Users} from "../../../router/user/user-types";
import {CreateGroupReq, GpMemberOrigin, GpMembers, GpMsgReq, GpMsgRes, GpMsgs, Group, GroupApls, Groups} from "./group-types";
import {InsertModal, UpdateModal} from "../../../types/sql-types";

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

export function addGpMsg(ws: ExtWebSocket, from: Users.Username, data: GpMsgReq, createdAt: Groups.CreatedAt, reads: GpMsgs.Reads) {
  const {fakeId, pre, to, content, type} = data
  return executeSocketSql<InsertModal>(ws, 'insert into group_chat(fakeId, pre, `from`, `to`, content, type, status, createdAt, `reads`) values(?, ?, ?, ?, ?, ?, ?, ?, ?);',
    [fakeId, pre, from, to, content, type, MsgStatus.normal, createdAt, reads])
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

export function selectGroupAplsById(ws: ExtWebSocket, from: Users.Username, preId: GroupApls.Id | undefined, lastGroupAplId: GroupApls.Id) {
  const join = preId == null ? '=' : '>='
  return executeSocketSql(ws, 'select * from group_applications where (`from` = ? and type = ?) or invitee = ? and id ' + join + ' ?;',
    [from, GroupApls.Type.active, from, preId || lastGroupAplId])
}

export function selectGpMsgReadsById(ws: ExtWebSocket, id: GpMsgs.Id, to: GpMsgs.To) {
  return executeSocketSql<{ reads: GpMsgs.Reads }[]>(ws, 'select `reads` from group_chat where id = ? and `to` = ?;', [id, to])
}

export function updateGpMsgReads(ws: ExtWebSocket, id: GpMsgs.Id, to: GpMsgs.To, reads: GpMsgs.Reads) {
  return executeSocketSql<UpdateModal>(ws, 'update group_chat set `reads` = ?, readCount = readCount + 1 where id = ? and `to` = ?;', [reads, id, to])
}

// export function addGroupApl(ws: ExtWebSocket, to: GroupApls.Id, from: Users.Username, reason: GroupApls.Reason) {
//   return executeSocketSql<InsertModal>(ws, 'insert into group_applications(`from`, invitee, reason, status) values(?, ?, ?, ?);', [from, to, reason, Status.pending])
// }

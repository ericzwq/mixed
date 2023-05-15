import {executeSocketSql} from "../../../db";
import {ExtWebSocket, MsgStatus} from "../../socket-types";
import {Users} from "../../../router/user/user-types";
import {CreateGroupReq, GpMemberOrigin, GpMembers, GpMsgReq, GpMsgRes, GpMsgs, Group, GroupApls, Groups} from "./group-types";
import {InsertModal, UpdateModal} from "../../../types/sql-types";
import Status = GroupApls.Status;

export function insertGroup(ws: ExtWebSocket, from: Users.Username, data: CreateGroupReq, createdAt: Groups.CreatedAt) {
  const {name} = data
  return executeSocketSql<InsertModal>(ws, 'insert into `groups`(name, avatar, leader, createdAt) values(?, ?, ?, ?);',
    [name, '/avatar/group-default.png', from, createdAt])
}

export function insertGroupMember(ws: ExtWebSocket, from: Users.Username, prohibition: GpMembers.prohibition, origin: GpMemberOrigin) {
  return executeSocketSql<InsertModal>(ws, 'insert into group_member(username, prohibition, origin) values (?, ?, ?);',
    [from, prohibition, origin])
}

export function addGpMsg(ws: ExtWebSocket, from: Users.Username, data: GpMsgReq, createdAt: Groups.CreatedAt) {
  const {fakeId, pre, to, content, type} = data
  return executeSocketSql<InsertModal>(ws, 'insert into group_chat(fakeId, pre, `from`, `to`, content, type, status, createdAt) values(?, ?, ?, ?, ?, ?, ?, ?);',
    [fakeId, pre, to, content, type, MsgStatus.normal, createdAt])
}

// 根据lastId获取当前客户端最后一条消息
export function selectLastGpMsg(ws: ExtWebSocket, lastId: GpMsgs.Id | null, from: GpMsgs.From, to: GpMsgs.To) {
  if (lastId != null) {
    return executeSocketSql<GpMsgRes[]>(ws,
      'select * from group_chat where id = ?;', [lastId])
  } else {
    return executeSocketSql<GpMsgRes[]>(ws,
      'select * from group_chat where next is null and ((`from` = ? and `to` = ?) or (`from` = ? and `to` = ?));', [from, to, to, from])
  }
}

export function updateGpMsgNext(ws: ExtWebSocket, next: GpMsgs.Next, id: GpMsgs.Id) {
  return executeSocketSql(ws,
    'update group_chat set next = ? where id = ?;', [next, id])
}

export function selectUserByUsername(ws: ExtWebSocket, username: Users.Username) {
  return executeSocketSql<[]>(ws, 'select 1 from users where username = ?;', [username])
}

export function insertGroupInvite(ws: ExtWebSocket, groupId: GroupApls.Id, from: Users.Username, to: Users.Username) {
  return executeSocketSql<InsertModal>(ws, 'insert into group_applications(groupId, `from`, invitee, type, status) values(?, ?, ?, ?, ?);',
    [groupId, from, to, GroupApls.Type.passive, GroupApls.Status.pending])
}

export function selectGroupById(ws: ExtWebSocket, id: Groups.Id) {
  return executeSocketSql<Group[]>(ws, 'select * from `groups` where id = ?;', [id])
}

export function selectGroupAplByAddGroup(ws: ExtWebSocket, groupId: GroupApls.Id, from: Users.Username) {
  return executeSocketSql<{ status: GroupApls.Status }[]>(ws,
    'select status from group_applications where `from` = ? and  groupId = ?;', [from, groupId])
}

export function selectGroupAplByInvite(ws: ExtWebSocket, from: Users.Username, groupId: GroupApls.Id) {
  return executeSocketSql<{ status: GroupApls.Status, to: Groups.Id }[]>(ws,
    'select status, groupId from group_applications where id = ? and invitee = ? and type = ?;', [groupId, from, GroupApls.Type.passive])
}

export function updateGroupAplStatus(ws: ExtWebSocket, id: GroupApls.Id, status: GroupApls.Status) {
  return executeSocketSql<UpdateModal>(ws, 'update group_applications set status = ? where id = ?;', [status, id])
}

export function updateGroupMember(ws: ExtWebSocket, id: Groups.Id, member: Groups.Member) {
  return executeSocketSql<UpdateModal>(ws, 'update `groups` set member = ? where id = ?;', [member, id])
}

export function resetGroupApl(ws: ExtWebSocket, groupId: GroupApls.Id, from: Users.Username, reason: GroupApls.Reason) {
  return executeSocketSql<UpdateModal>(ws, 'update group_applications set reason = ? where `from` = ? and groupId = ?;', [reason, from, groupId])
}

export function addGroupApl(ws: ExtWebSocket, to: GroupApls.Id, from: Users.Username, reason: GroupApls.Reason) {
  return executeSocketSql<InsertModal>(ws, 'insert into group_applications(`from`, invitee, reason, status) values(?, ?, ?, ?);', [from, to, reason, Status.pending])
}
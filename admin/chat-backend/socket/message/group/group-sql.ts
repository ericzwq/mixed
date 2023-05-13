import {executeSocketSql} from "../../../db";
import {ExtWebSocket} from "../../socket-types";
import {Users} from "../../../router/user/user-types";
import {CreateGroupReq, Group, GroupApls, GroupInviteRetReq, Groups} from "./group-types";
import {InsertModal, UpdateModal} from "../../../types/sql-types";
import Status = GroupApls.Status;

export function insertGroup(ws: ExtWebSocket, from: Users.Username, data: CreateGroupReq, createdAt: Groups.CreatedAt) {
  const {name} = data
  return executeSocketSql<InsertModal>(ws, 'insert into `groups`(name, avatar, leader, createdAt) values(?, ?, ?, ?);',
    [name, '/avatar/group-default.png', from, createdAt])
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
  return executeSocketSql<{ status: GroupApls.Status, groupId: Groups.Id }[]>(ws,
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
import {executeSocketSql} from "../../../db";
import {ExtWebSocket, Group, Groups} from "../../socket-types";
import {Users} from "../../../router/user/user-types";
import {GroupApls} from "./group-types";
import {InsertModal, UpdateModal} from "../../../types/sql-types";
import Status = GroupApls.Status;

export function selectGroupById(ws: ExtWebSocket, id: Groups.Id) {
  return executeSocketSql<Group[]>(ws, 'select * from `groups` where id = ?;', [id])
}

export function selectGroupAplByAddGroup(ws: ExtWebSocket, to: Groups.Id, from: Users.Username) {
  return executeSocketSql<{ status: GroupApls.Status }[]>(ws, 'select status from group_applications where `from` = ? and  `to` = ?;', [from, to])
}

export function resetGroupApl(ws: ExtWebSocket, to: Groups.Id, from: Users.Username, reason: GroupApls.Reason) {
  return executeSocketSql<UpdateModal>(ws, 'update group_applications set reason = ? where `from` = ? and `to` = ?;', [reason, from, to])
}

export function addGroupApl(ws: ExtWebSocket, to: Groups.Id, from: Users.Username, reason: GroupApls.Reason) {
  return executeSocketSql<InsertModal>(ws, 'insert group_applications(`from`, `to`, reason, status) values(?, ?, ?, ?);', [from, to, reason, Status.pending])
}
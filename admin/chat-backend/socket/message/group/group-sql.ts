import {executeSocketSql} from "../../../db";
import {Group, Groups} from "../../socket-types";
import {Users} from "../../../router/user/user-types";
import {GroupApls} from "./group-types";
import {InsertModal, UpdateModal} from "../../../types/sql-types";

export function selectGroupById(id: Groups.Id) {
  return executeSocketSql<Group[]>('select * from `groups` where id = ?;', [id])
}

export function selectGroupAplByAddGroup(to: Groups.Id, from: Users.Username) {
  return executeSocketSql<{ status: number }[]>('select status from group_applications where `from` = ? and  `to` = ?;', [from, to])
}

export function resetGroupApl(to: Groups.Id, from: Users.Username, reason: GroupApls.Reason) {
  return executeSocketSql<UpdateModal>('update group_applications set reason = ? where `from` = ? and `to` = ?;', [reason, from, to])
}

export function addGroupApl(to: Groups.Id, from: Users.Username, reason: GroupApls.Reason) {
  return executeSocketSql<InsertModal>('insert group_applications(`from`, `to`, reason, status) values(?, ?, ?, 0);', [from, to, reason])
}
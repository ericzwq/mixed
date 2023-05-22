import {executeSocketSql} from '../../../db'
import {User, Users} from '../../../router/user/user-types'
import {Contacts} from "./contact-types";
import Status = Contacts.Status;
import {ExtWebSocket} from "../../socket-types";
import {InsertModal, UpdateModal} from "../../../types/sql-types";

interface Contact {
  username: Users.Username
  nickname: Users.Nickname
  avatar: Users.Avatar
  remark: Contacts.Remark
  status: Contacts.Status
}

// 获取通讯录
export function getContactsByUsername(ws: ExtWebSocket, session: User) {
  return executeSocketSql<Contact[]>(
    ws, 'select u.username, u.nickname, u.avatar, c.remark, c.status from contacts c left join users u on c.sub = u.username where c.master = ? and status in (?, ?);',
    [session.username, Status.normal, Status.blackList])
}

export function addContactByMasterAndSub(ws: ExtWebSocket, sub: Users.Username, master: Users.Username, status: Contacts.Status, remark: Contacts.Remark) {
  return executeSocketSql<InsertModal>(ws, `insert into contacts(master, sub, status, remark) values(?, ?, ?, ?);`, [master, sub, status, remark])
}

export function updateContactStatus(ws: ExtWebSocket, id: Contacts.Id, sub: Users.Username, master: Users.Username, status: Contacts.Status) {
  return executeSocketSql<UpdateModal>(ws, 'update contacts set status = ? where id = ? and master = ? and sub = ?;', [status, id, master, sub])
}

export function selectContactBySub(ws: ExtWebSocket, sub: Users.Username, master: Users.Username) {
  return executeSocketSql<{ id: Contacts.Id, status: Contacts.Status }[]>(ws, 'select id, status from contacts where (master = ? and sub = ?);', [master, sub])
}

export function resetContactById(ws: ExtWebSocket, id: Contacts.Id, remark: Contacts.Remark, status: Contacts.Status) {
  return executeSocketSql<UpdateModal>(ws, 'update contacts set remark = ?, status = ? where id = ?;', [remark, status, id])
}
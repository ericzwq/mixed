import {Users} from '../../../router/user/user-types'
import {executeSocketSql} from '../../../db'
import {Contacts} from '../contact/contact-types'
import {InsertModal, UpdateModal} from '../../../types/sql-types'
import {FriendApls} from './user-types'
import Status = FriendApls.Status;

export function getUserByUsername(username: Users.Username) {
  return executeSocketSql<{
    username: Users.Username, nickname: Users.Nickname, avatar: Users.Avatar
  }[]>('select username, nickname, avatar from users where username = ? limit 1;', [username])
}

export function addContactByMasterAndSub(sub: Users.Username, master: Users.Username, status: Contacts.Status, remark: Contacts.Remark) {
  return executeSocketSql<InsertModal>(`insert contacts(master, sub, status, remark) values(?, ?, ?, ?);`, [master, sub, status, remark])
}

export function updateContactStatus(id: Contacts.Id, sub: Users.Username, master: Users.Username, status: Contacts.Status) {
  return executeSocketSql<UpdateModal>('update contacts set status = ? where id = ? and master = ? and sub = ?;', [status, id, master, sub])
}

export function selectContactByAddUser(to: Users.Username, from: Users.Username) {
  return executeSocketSql<{ id: Contacts.Id, status: Contacts.Status }[]>('select id, status from contacts where (master = ? and sub = ?);', [from, to])
}

export function resetContactById(id: Contacts.Id, remark: Contacts.Remark) {
  return executeSocketSql<UpdateModal>('update contacts set remark = ?, status = ? where id = ?;', [remark, Contacts.Status.delete, id])
}

export function selectFriendAplByAddUser(to: Users.Username, from: Users.Username) {
  return executeSocketSql<{ id: FriendApls.Id, status: FriendApls.Status }[]>('select id, status from friend_applications where `from` = ? and `to` = ?;', [from, to])
}

export function addFriendApl(to: Users.Username, from: Users.Username, reason: FriendApls.Reason) {
  return executeSocketSql<InsertModal>('insert friend_applications(`from`, `to`, reason, status) values(?, ?, ?, 0);', [from, to, reason])
}

export function resetFriendAplById(id: FriendApls.Id, reason: FriendApls.Reason) {
  return executeSocketSql<UpdateModal>('update friend_applications set status = ?, reason = ? where id = ?;', [Status.pending, reason, id])
}

export function updateFriendAplStatus(id: FriendApls.Id, to: Users.Username, from: Users.Username, status: FriendApls.Status) { // 顺便校验from、to、status的正确性
  return executeSocketSql<InsertModal>('update friend_applications set status = ? where id = ? and `from` = ? and `to` = ? and status = ?;', [status, id, from, to, Status.pending])
}

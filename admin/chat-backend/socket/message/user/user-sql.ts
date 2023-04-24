import {Users} from '../../../router/user/user-types'
import {executeSocketSql} from '../../../db'
import {Contacts} from '../contact/contact-types'
import {InsertModal, UpdateModal} from '../../../types/sql-types'

export function searchUserByUsername(username: Users.Username) {
  return executeSocketSql<{
    username: Users.Username, nickname: Users.Nickname, avatar: Users.Avatar
  }[]>('select username, nickname, avatar from users where username = ? limit 1;', [username])
}

export function addContactRemark(to: Users.Username, from: Users.Username, remark: string) {
  return executeSocketSql<InsertModal>(`insert contacts(master, sub, status, remark) values(?, ?, 1, ?);`, [from, to, remark])
}

export function updateContactStatus(to: Users.Username, from: Users.Username, status: number) {
  return executeSocketSql<UpdateModal>('update contacts set status = ? where master = ? and sub = ?;', [status, from, to])
}

export function selectContactByAddUser(to: Users.Username, from: Users.Username) {
  return executeSocketSql<{ id: number, status: Contacts.Status }[]>('select id, status from contacts where (master = ? and sub = ?);', [from, to])
}

export function updateContactRemarkAndStatusById(id: number, remark: string) {
  return executeSocketSql<UpdateModal>('update contacts set remark = ?, status = 1 where id = ?;', [remark, id])
}

export function selectFriendApplicationByAddUser(to: Users.Username, from: Users.Username) {
  return executeSocketSql<{ status: number }[]>('select status from friend_applications where `from` = ? and `to` = ?;', [from, to])
}

export function addFriendApplication(to: Users.Username, from: Users.Username, reason: string) {
  return executeSocketSql<InsertModal>('insert friend_applications(`from`, `to`, reason, status) values(?, ?, ?, 0);', [from, to, reason])
}

export function resetFriendApplication(to: Users.Username, from: Users.Username, reason: string) {
  return executeSocketSql('update friend_applications set status = 0, reason = ? where `from` = ? and `to` = ?;', [reason, from, to])
}

export function updateFriendApplicationStatus(to: Users.Username, from: Users.Username, status: number) {
  return executeSocketSql<InsertModal>('update friend_applications set status = ? where `from` = ? and `to` = ? and status = 0;', [status, from, to])
}

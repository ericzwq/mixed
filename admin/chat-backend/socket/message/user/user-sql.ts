import {SessionData, Users} from '../../../router/user/user-types'
import {executeSocketSql} from '../../../db'
import {AddUserBody, SearchUserQuery} from './user-types'
import {Contacts} from '../contact/contact-types'
import {InsertModal, UpdateModal} from '../../../types/sql-types'

export function searchUserByUsername(data: SearchUserQuery) {
  const {username} = data
  return executeSocketSql<{ username: Users.Username, nickname: Users.Nickname, avatar: Users.Avatar }[]>('select username, nickname, avatar from users where username = ? limit 1;', [username])
}

export function addUserByUsername(to: Users.Username, from: Users.Username, status: string, isInsert: boolean, isMaster: boolean) {
  let insertData = [from, to]
  let updateData = insertData.map(v => v)
  if (isInsert) { // 无记录则为主动方
    return executeSocketSql<InsertModal>(`insert contacts(master, sub, status) values(?, ?, '01');`, insertData)
  } else { // 修改
    if (!isMaster) { // 非原始主动方
      updateData = updateData.reverse()
    }
    return executeSocketSql<UpdateModal>('update contacts set status = ? where master = ? and sub = ?;', [status].concat(updateData))
  }
}

export function selectContactByAddUser(to: Users.Username, from: Users.Username) {
  return executeSocketSql<{
    master: Contacts.Master, status: Contacts.Status
  }[]>('select master,status from contacts where (master = ? and sub = ?) or (master = ? and sub = ?);', [from, to, to, from])
}

export function selectFriendApplicationByAddUser(to: Users.Username, from: Users.Username) {
  return executeSocketSql<{ status: number }[]>('select status from friend_applications where `from` = ? and `to` = ?;', [from, to])
}

export function addFriendApplication(to: Users.Username, from: Users.Username) {
  return executeSocketSql<InsertModal>('insert friend_applications(`from`, `to`, status) values(?, ?, ?);', [from, to, 0])
}

export function resetFriendApplication(to: Users.Username, from: Users.Username) {
  return executeSocketSql('update friend_applications set status = ? where `from` = ? and `to` = ?;', [0, from, to])
}

export function updateFriendApplicationByConfirm(to: Users.Username, from: Users.Username, status: number) {
  return executeSocketSql<InsertModal>('update friend_applications set status = ? where `from` = ? and `to` = ? and status = 0;', [status, from, to])
}

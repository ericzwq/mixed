import {InsertModal, UpdateModal} from '../../../types/sql-types'
import {Context} from 'koa'
import {executeSocketSql} from '../../../db'
import {SessionData, Users} from '../../../router/user/user-types'
import {AddUserBody, Contacts} from "./contact-types";

// 校验联系人
export function checkContact(body: AddUserBody, session: SessionData) {
  return executeSocketSql<{
    master: Contacts.Master, status: Contacts.Status
  }[]>('select master,status from contacts where (master = ? and sub = ?) or (master = ? and sub = ?);', [session!.username, body.username, body.username, session!.username])
}

interface Contact {
  username: Users.Username,
  nickname: Users.Nickname,
  avatar: Users.Avatar,
  status: Contacts.Status
}

// 获取通讯录
export function getContactsByUsername(session: SessionData) {
  const username = session!.username
  const p1 = executeSocketSql<Contact[]>('select u.username, u.nickname, u.avatar, c.status from contacts c left join users u on c.sub = u.username where c.master = ?;', [username])
  const p2 = executeSocketSql<Contact[]>('select u.username, u.nickname, u.avatar, c.status from contacts c left join users u on c.master = u.username where c.sub = ?;', [username])
  return Promise.all([p1, p2])
}

export function addUserByUsername(body: AddUserBody, session: SessionData, isInsert: boolean, isMaster: boolean) {
  const {username, status} = body
  let insertData = [session!.username, username]
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
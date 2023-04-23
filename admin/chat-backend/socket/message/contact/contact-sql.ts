import {executeSocketSql} from '../../../db'
import {SessionData, Users} from '../../../router/user/user-types'
import {Contacts} from "./contact-types";

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

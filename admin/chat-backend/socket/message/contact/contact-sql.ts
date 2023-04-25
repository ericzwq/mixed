import {executeSocketSql} from '../../../db'
import {SessionData, Users} from '../../../router/user/user-types'
import {Contacts} from "./contact-types";

interface Contact {
  username: Users.Username
  nickname: Users.Nickname
  avatar: Users.Avatar
  remark: Contacts.Remark
  status: Contacts.Status
}

// 获取通讯录
export function getContactsByUsername(session: SessionData) {
  return executeSocketSql<Contact[]>(
    'select u.username, u.nickname, u.avatar, c.remark, c.status from contacts c left join users u on c.sub = u.username where c.master = ? and status in (0, 2);',
    [session.username])
}
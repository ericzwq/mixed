import {Users} from '../../../router/user/user-types'
import {executeSocketSql} from '../../../db'
import {Contacts} from '../contact/contact-types'
import {InsertModal, UpdateModal} from '../../../types/sql-types'
import {ExtWebSocket} from '../../socket-types'

export function getUserByUsername(ws: ExtWebSocket, username: Users.Username) {
  return executeSocketSql<{
    username: Users.Username, nickname: Users.Nickname, avatar: Users.Avatar, email: Users.Email
  }[]>(ws, 'select username, nickname, avatar, email from users where username = ? limit 1;', [username])
}

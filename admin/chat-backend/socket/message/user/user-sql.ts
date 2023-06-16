import {Users} from '../../../router/user/user-types'
import {executeSocketSql} from '../../../db'
import {Contacts} from '../contact/contact-types'
import {InsertModal, UpdateModal} from '../../../types/sql-types'
import {ExtWebSocket} from '../../socket-types'
import {Groups} from "../group/group-types";

export function getUserByUsername(ws: ExtWebSocket, username: Users.Username) {
  return executeSocketSql<{
    username: Users.Username, nickname: Users.Nickname, avatar: Users.Avatar, email: Users.Email
  }[]>(ws, 'select username, nickname, avatar, email from users where username = ? limit 1;', [username])
}

export function addUserGroups(ws: ExtWebSocket, username: Users.Username, groupId: Groups.Id) {
  return executeSocketSql<UpdateModal>(ws, 'update users set `groups` = concat(`groups`, ?) where username = ?;', [',' + groupId, username])
}

export function selectUserGroups(ws: ExtWebSocket, username: Users.Username) {
  return executeSocketSql<{ groups: string }[]>(ws, 'select `groups` from users where username = ?;', [username])
}
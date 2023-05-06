import {LoginReqBody, RegisterBody, User} from './user-types'
import {InsertModal} from '../../types/sql-types'
import {Users} from './user-types'
import {Context} from 'koa'
import {executeSql} from '../../db'

export function getEmailByUsernameOrEmail(ctx: Context) {
  const {username, email} = ctx.request.body as RegisterBody
  return executeSql<{ email: Users.Email }[]>(ctx, 'select email from users where username = ? or email = ? limit 1;', [username, email])
}

export function addUser(ctx: Context) {
  const {username, password, email} = ctx.request.body as RegisterBody
  return executeSql<InsertModal>(ctx, 'insert users(username, password, email) values (?, ?, ?);', [username, password, email])
}

export function getUserByLogin(ctx: Context) {
  const {username, password} = ctx.request.body as LoginReqBody
  return executeSql<User[]>(ctx, 'select username,nickname,avatar,email,last_friend_apl_id,last_group_apl_id from users where username = ? and password = ?', [username, password])
}

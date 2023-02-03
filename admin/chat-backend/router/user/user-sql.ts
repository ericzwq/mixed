import { LoginReqBody, RegisterBody, SearchUserQuery } from './user-types'
import { InsertModal } from '../../types/sql-types'
import { Users } from './user-types'
import { Context } from 'koa'
import { executeSql } from '../../db'

export function getEmailByUsernameOrEmail(ctx: Context) {
	const { username, email } = ctx.request.body as RegisterBody
	return executeSql<{ email: Users.Email }[]>(ctx, 'select email from users where username = ? or email = ? limit 1;', [username, email])
}

export function addUser(ctx: Context) {
	const { username, password, email } = ctx.request.body as RegisterBody
	return executeSql<InsertModal>(ctx, 'insert users(username, password, email) values (?, ?, ?);', [username, password, email])
}

export function getUserByLogin(ctx: Context) {
	const { username, password } = ctx.request.body as LoginReqBody
	return executeSql<{
		username: Users.Username, nickname: Users.Nickname, avatar: Users.Avatar, email: Users.Email
	}[]>(ctx, 'select username,nickname,avatar,email from users where username = ? and password = ?', [username, password])
}

export function searchUserByUsername(ctx: Context) {
	const { username } = ctx.request.query as SearchUserQuery
	return executeSql<{ username: Users.Username, nickname: Users.Nickname, avatar: Users.Avatar }[]>(ctx, 'select username, nickname, avatar from users where username = ? limit 1;', [username])
}

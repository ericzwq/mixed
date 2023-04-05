import { ParsedUrlQuery } from 'querystring'
import { Session } from 'koa-session'

export namespace Users {
	export type Username = string
	export type Password = string
	export type Nickname = string
	export type Avatar = string
	export type Email = string
	export type Code = string
}

// session储存信息
export interface SessionData extends Session {
	username: Users.Username
	loginTime: string
	leaveTime: string
	login: boolean
	email: Users.Email
	emailCode?: Users.Code
	emailCodeTime?: number
}

export interface RegisterBody {
	username: Users.Username
	password: Users.Password
	nickname: Users.Nickname
	avatar: Users.Avatar
	email: Users.Email
	code: Users.Code
}

export interface GetEmailCodeQuery extends ParsedUrlQuery {
	email: Users.Email
}

export interface SearchUserQuery extends ParsedUrlQuery {
	username: Users.Username
}

export interface LoginReqBody {
	username: Users.Username
	password: Users.Password
}
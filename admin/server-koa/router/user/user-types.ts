import {ParsedUrlQuery} from 'querystring'
import {Session} from 'koa-session'
import {Users} from '../../types/users-types'

// session储存信息
export interface SessionData extends Session {
  id: Users.Id
  username: Users.Username
  loginTime: string
  login: boolean
  email: Users.Email
  emailCode?: Users.Code
  emailCodeTime?: number
}

export interface RegisterBody {
  username: Users.Username
  password: Users.Password
  email: Users.Email
  code: Users.Code
}

export interface GetEmailCodeQuery extends ParsedUrlQuery {
  email: Users.Email
}

export interface LoginReqBody {
  username: Users.Username
  password: Users.Password
}

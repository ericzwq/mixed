import 'koa-session'
import {Connection} from 'mysql'
import { Users } from './router/user/user-types'

declare module 'koa' {
  interface BaseContext {
    connection: Connection
  }
}
declare module 'koa-session' {
  interface Session {
    // 懒得做非空判断，登录了就有，没登录也不会用到
    username: Users.Username
    loginTime: string
    login: boolean
    email: Users.Email
    emailCode?: Users.Code
    emailCodeTime?: number
  }
}

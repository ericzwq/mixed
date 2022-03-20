import {Connection} from 'mysql'
import {LoginReqBody, RegisterBody} from './user-types'
import {InsertQueryCallback, SelectQueryCallback} from '../../types/sql-types'
import {Users} from '../../types/users-types'

export function getEmailByUsernameOrEmail(con: Connection, {username, email}: RegisterBody, cb: SelectQueryCallback<{ email: Users.Email }>) {
  con.query('select email from users where username = ? or email = ? limit 1;', [username, email], cb)
}

export function addUser(con: Connection, {username, password, email}: RegisterBody, cb: InsertQueryCallback) {
  con.query('insert users(username, password, email) values (?, ?, ?);', [username, password, email], cb)
}

export function getUserByLogin(con: Connection, {username, password}: LoginReqBody, cb: SelectQueryCallback<{ id: Users.Id }>) {
  con.query('select id from users where username = ? and password = ?', [username, password], cb)
}

import {Connection} from 'mysql'
import {CreatePostSqlData} from './creation-types'
import {InsertQueryCallback} from '../../types/sql-types'

export function createPost(con: Connection, {id, content, images, videos}: CreatePostSqlData, cb: InsertQueryCallback) {
  con.query('insert posts(userId, content, images, videos) values (?, ?, ?, ?);', [id, content, images || null, videos || null], cb)
}

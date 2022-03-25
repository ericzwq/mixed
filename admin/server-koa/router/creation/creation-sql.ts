import {Connection} from 'mysql'
import {CreatePostSql} from './creation-types'
import {InsertQueryCallback} from '../../types/sql-types'

export function createPost(con: Connection, {id, content, contentType, images, videos}: CreatePostSql, cb: InsertQueryCallback) {
  con.query('insert posts(userId, content,contentType, images, videos) values (?, ?, ?, ?, ?);', [id, content, contentType, images?.join(',') || null, videos?.join(',') || null], cb)
}

import {Connection} from 'mysql'
import {PageParameter, SelectQueryListCallback} from '../../types/sql-types'
import {getLimitSql, selectTotal, totalRows} from '../../db'
import {Post} from './index-types'

export function selectPosts(con: Connection, query: PageParameter, cb: SelectQueryListCallback<Post>) {
  con.query(`select ${totalRows} id, userId, content, images, videos, createdAt
             from posts ${getLimitSql(query)}
             order by updatedAt DESC;
  ${selectTotal}`, cb)
}

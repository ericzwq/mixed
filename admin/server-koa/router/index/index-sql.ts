import {Connection} from 'mysql'
import {PageParameter, SelectQueryListCallback} from '../../types/sql-types'
import {getLimitSql, selectTotal, totalRows} from '../../db'
import {Post} from './index-types'

export function selectPosts(con: Connection, query: PageParameter, cb: SelectQueryListCallback<Post>) {
  con.query(`select ${totalRows} 
                    user.username,
                    post.id,
                    post.userId,
                    post.content,
                    post.images,
                    post.videos,
                    post.likes,
                    post.comments,
                    post.createdAt
             from posts as post
                      left join users as user on user.id = post.userId
             order by post.updatedAt DESC ${getLimitSql(query)};
  ${selectTotal}`, cb)
}

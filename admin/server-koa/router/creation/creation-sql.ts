import {CreatePostBody} from './creation-types'
import {InsertModal} from '../../types/sql-types'
import {Context} from 'koa'
import {executeSql} from '../../db'

export function createPost(ctx: Context) {
  const {content, contentType, images, videos} = ctx.request.body as CreatePostBody
  return executeSql<InsertModal>(ctx, 'insert posts(userId, content,contentType, images, videos) values (?, ?, ?, ?, ?);',
    [ctx.session!.id, content, contentType, images?.join(',') || null, videos?.join(',') || null])
}

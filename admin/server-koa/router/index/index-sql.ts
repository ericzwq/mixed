import {DeleteModal, InsertModal, PageParameter, SelectListModel, SqlConfig, UpdateModal} from '../../types/sql-types'
import {executeSql, getLimitSql, selectTotal} from '../../db'
import {CommentPostBody, LikePostBody, Post} from './index-types'
import {Context} from 'koa'

export function selectPosts(ctx: Context) {
  const query = ctx.request.query as PageParameter
  return executeSql<SelectListModel<Post>>(ctx, `select SQL_CALC_FOUND_ROWS user.username,
                                                                            post.id,
                                                                            post.userId,
                                                                            post.content,
                                                                            post.contentType,
                                                                            post.images,
                                                                            post.videos,
                                                                            post.likes,
                                                                            post.comments,
                                                                            post.createdAt,
                                                                            pl.userId is not null liked
                                                 from posts as post
                                                          left join users as user on user.id = post.userId
                                                          left join post_likes pl on post.userId = pl.userId and pl.postId = post.id
                                                 order by post.updatedAt DESC ${getLimitSql(query)};
  ${selectTotal}`)
}

export function deletePostLikes(ctx: Context) {
  const {postId} = ctx.request.body as LikePostBody
  return executeSql<DeleteModal[]>(ctx, 'begin; delete from post_likes where userId = ? and postId = ?;', [ctx.session!.id, postId])
}

export function updatePostLike(ctx: Context) {
  const {postId, moreOrLess} = ctx.request.body as LikePostBody
  return executeSql<UpdateModal>(ctx, `update posts
                                       set likes = likes ${moreOrLess} 1
                                       where id = ?;
  commit;`, [postId], new SqlConfig({errorRollback: true}))
}

export function addPostLikes(ctx: Context) {
  const {postId} = ctx.request.body as LikePostBody
  return executeSql<InsertModal>(ctx, 'insert post_likes(postId, userId) values(?, ?);', [postId, ctx.session!.id], new SqlConfig({errorRollback: true}))
}

export function commentPost(ctx: Context) {
  const {postId, content, parentId} = ctx.request.body as CommentPostBody
  return executeSql<InsertModal>(ctx, 'insert post_comments(postId, userId, content, parentId) values(?, ?, ?, ?);', [postId, ctx.session!.id, content, parentId])
}

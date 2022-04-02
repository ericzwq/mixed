import Router = require('koa-router')
import {commentPostSchema, likePostSchema, selectPostsSchema} from './index-schema'
import {deletePostLikes, updatePostLike, selectPosts, addPostLikes, commentPost} from './index-sql'
import {commentPostUrl, likePostUrl, selectPostsUrl} from '../urls'
import {CommentPostBody, LikePostBody} from './index-types'
import {ResponseSchema} from '../../response/response'
import {checkParams} from '../../common/utils'

const index = new Router()

index.get(selectPostsUrl, async ctx => {
  await checkParams(ctx, selectPostsSchema, ctx.request.query, 1201)
  const {result} = await selectPosts(ctx)
  result[0].forEach(post => {
    post.imageList = post.images?.split(',') || []
    post.videoList = post.videos?.split(',') || []
    post.images = undefined
    post.videos = undefined
  })
  console.log(result[0])
  ctx.body = new ResponseSchema({data: result[0], totalCount: result[1][0].totalCount})
})

index.post(likePostUrl, async ctx => {
  const body: LikePostBody = ctx.request.body
  await checkParams(ctx, likePostSchema, body, 1202)
  const {result} = await deletePostLikes(ctx)
  await new Promise<void>(async resolve => {
    if (result[1].affectedRows) { // 取消点赞
      body.moreOrLess = '-'
      ctx.body = new ResponseSchema({message: '取消点赞成功', data: {type: 0}})
      resolve()
    } else {
      body.moreOrLess = '+'
      await addPostLikes(ctx)
      ctx.body = new ResponseSchema({message: '点赞成功', data: {type: 1}})
      resolve()
    }
  })
  await updatePostLike(ctx)
})

index.post(commentPostUrl, async ctx => {
  const body = ctx.request.body as CommentPostBody
  await checkParams(ctx, commentPostSchema, body, 1203)
  console.log(body, 2)
  await commentPost(ctx)
  ctx.body = new ResponseSchema({message: 'ok'})
})

export default index

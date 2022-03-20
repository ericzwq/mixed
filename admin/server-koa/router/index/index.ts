import Router = require('koa-router')
import {selectPostsSchema} from './index-schema'
import {querySql} from '../../db'
import {selectPosts} from './index-sql'
import {PageParameter} from '../../types/sql-types'

const index = new Router()
index.get('selectPosts', ctx => {
  console.log('select')
  const validation = selectPostsSchema.validate(ctx.request.query)
  if (validation.error) return ctx.body = {message: validation.error.message, status: 1201, data: []}
  return new Promise(resolve => {
    querySql(ctx, resolve).then(con => {
      selectPosts(con, ctx.request.query as unknown as PageParameter, (err, res) => {
        if (err) return resolve(ctx.body = {message: '查询失败', status: 1202, data: []})
        res[0].forEach(post => {
          post.imageList = post.images?.split(',') || []
          post.videoList = post.videos?.split(',') || []
          post.images = undefined
          post.videos = undefined
        })
        console.log(res[0].length, res[1])
        resolve(ctx.body = {message: '查询成功', status: 0, data: res[0], totalCount: res[1][0].totalCount})
      })
    })
  })
})
export default index

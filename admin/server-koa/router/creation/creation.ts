import Router = require('koa-router')
import {createPost} from './creation-sql'
import {querySql} from '../../db'
import {CreatePostBody, CreatePostFiles} from './creation-types'
import path = require('path')
import fs = require('fs')

const creation = new Router()
creation.post('createPost', ctx => {
  const body = ctx.request.body as CreatePostBody
  const files = ctx.request.files as unknown as CreatePostFiles
  if (!body.content && !files?.images && !files?.videos) return ctx.body = {message: 'one of content, images, videos must be not empty!', status: 1101, data: false}
  return new Promise(resolve => {
    querySql(ctx, resolve).then(con => {
      const paths = {
          images: '',
          videos: ''
        }
      ;(['images', 'videos'] as const).forEach(k => {
        const fileType = files[k]
        if (fileType) {
          if (Array.isArray(fileType)) {
            fileType.forEach(file => paths[k] += path.parse(file.path).base + ',')
            paths[k] = paths[k].slice(0, -1)
          } else {
            paths[k] = path.parse(fileType.path).base
          }
        }
      })
      createPost(con, {id: ctx.session!.id, ...body, ...paths}, (err, res) => {
        if (err) return resolve(ctx.body = {message: '发布异常', status: 1102, data: false})
        if (res.affectedRows) return resolve(ctx.body = {message: '发布成功', status: 0, data: true})
        resolve(ctx.body = {message: '发布失败', status: 1103, data: false})
      })
    }, () => {
      // 新增失败删除文件
      ;(['images', 'videos'] as const).forEach(k => {
        const fileType = files[k]
        if (fileType) {
          Array.isArray(fileType) ? fileType.forEach(file => fs.unlink(file.path, () => 1)) : fs.unlink(fileType.path, () => 1)
        }
      })
    })
  })
})

export default creation

import Router = require('koa-router')
import {createPost} from './creation-sql'
import {querySql} from '../../db'
import {CreatePostBody, UploadFiles} from './creation-types'
import path = require('path')
import fs = require('fs')
import {createPostUrl, uploadUrl} from '../urls'
import {picSet, UPLOAD_PATH, videoSet} from '../../common/consts'
import {createPostSchema} from './creation-schema'

const creation = new Router()
// 创建帖子
creation.post(createPostUrl, ctx => {
  const body = ctx.request.body as CreatePostBody
  const validation = createPostSchema.validate(body)
  if (validation.error) return ctx.body = {message: validation.error.message, status: 1101, data: false}
  console.log(body)
  // if (!body.content?.trim() && !body.images?.length && !body.videos?.length) return ctx.body = {message: 'one of content, images, videos must be not empty!', status: 1101, data: false}
  const deleteFiles = () => (['images', 'videos'] as const).forEach(type => body[type]!.forEach(name => fs.unlink(path.resolve(__dirname, UPLOAD_PATH, '/' + name), () => 1)))
  return new Promise(resolve => {
    querySql(ctx, resolve).then(con => {
      createPost(con, {id: ctx.session!.id, ...body}, (err, res) => {
        if (res?.affectedRows) return resolve(ctx.body = {message: '发布成功', status: 0, data: true})
        deleteFiles()
        if (err) return resolve(ctx.body = {message: '发布异常', status: 1102, data: false})
        resolve(ctx.body = {message: '发布失败', status: 1103, data: false})
      })
    }, deleteFiles)
  })
})

// 上传帖子图片或视频
creation.post(uploadUrl, ctx => {
  const files = ctx.request.files as UploadFiles
  if (!files?.assets) return ctx.body = {message: 'assets is required', status: 1104, data: []}
  const assets = Array.isArray(files.assets) ? files.assets : [files.assets]
  const data: string[] = []
  let flag = true
  assets.forEach(asset => {
    let {base, ext} = path.parse(asset.path)
    ext = ext.toLowerCase()
    data.push(base)
    const valid = picSet.has(ext) || videoSet.has(ext)
    if (!valid) fs.unlink(asset.path, () => 1)
    if (flag) flag = valid
  })
  if (!flag) return ctx.body = {message: '只允许上传图片或视频', status: 1105, data: []}
  ctx.body = {message: '上传成功', status: 0, data}
})

export default creation

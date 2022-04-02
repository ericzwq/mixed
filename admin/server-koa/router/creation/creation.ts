import Router = require('koa-router')
import {createPost} from './creation-sql'
import {CreatePostBody, UploadFiles} from './creation-types'
import path = require('path')
import fs = require('fs')
import {createPostUrl, uploadUrl} from '../urls'
import {picSet, UPLOAD_PATH, videoSet} from '../../common/consts'
import {createPostSchema} from './creation-schema'
import {ResponseSchema} from '../../response/response'
import {checkParams} from '../../common/utils'

const creation = new Router()
// 创建帖子
creation.post(createPostUrl, async ctx => {
  const body = ctx.request.body as CreatePostBody
  await checkParams(ctx, createPostSchema, body, 1101)
  console.log(body)
  try {
    await createPost(ctx)
    ctx.body = new ResponseSchema({message: '发布成功'})
  } catch (e) {
    (['images', 'videos'] as const).forEach(type => body[type]!.forEach(name => fs.unlink(path.resolve(__dirname, UPLOAD_PATH, '/' + name), () => 1)))
    ctx.body = new ResponseSchema({message: '发布失败', status: 1102})
  }
})

// 上传帖子图片或视频
creation.post(uploadUrl, ctx => {
  const files = ctx.request.files as UploadFiles
  if (!files?.assets) return ctx.body = new ResponseSchema({message: 'assets is required', status: 1103})
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
  if (!flag) return ctx.body = new ResponseSchema({message: '只允许上传图片或视频', status: 1104})
  ctx.body = new ResponseSchema({message: '上传成功', data})
})

export default creation

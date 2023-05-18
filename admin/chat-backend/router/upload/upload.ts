import * as Router from "koa-router";
import {upPicUrl, upVideoUrl} from "../urls";
import {picSet, UPLOAD_STATIC_PATH, videoSet} from "../../common/consts";
import path = require("path");
import * as fs from "fs";
import {ResponseSchema} from "../../response/response";
import {checkParams} from "../../common/utils";
import {upFileSchema} from "./upload-schema";
import * as formidable from "formidable";

const upload = new Router

// 上传图片
upload.post(upPicUrl, async ctx => {
  await checkParams(ctx, upFileSchema, ctx.request.files, 1001)
  const file = ctx.request.files!.file as formidable.File
  let {base, ext} = path.parse(file.path)
  if (!picSet.has(ext.toLowerCase())) {
    fs.unlink(file.path, () => 1)
    return ctx.body = new ResponseSchema({message: '请上传图片文件', status: 1002})
  }
  ctx.body = new ResponseSchema({message: '上传成功', data: UPLOAD_STATIC_PATH + base})
})

// 上传视频
upload.post(upVideoUrl, async ctx => {
  await checkParams(ctx, upFileSchema, ctx.request.files, 1003)
  const file = ctx.request.files!.file as formidable.File
  let {base, ext} = path.parse(file.path)
  if (!videoSet.has(ext.toLowerCase())) {
    fs.unlink(file.path, () => 1)
    return ctx.body = new ResponseSchema({message: '请上传视频文件', status: 1004})
  }
  ctx.body = new ResponseSchema({message: '上传成功', data: UPLOAD_STATIC_PATH + base})
})

export default upload
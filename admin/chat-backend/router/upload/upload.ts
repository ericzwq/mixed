import * as Router from "koa-router";
import {upAvatarUrl} from "../urls";
import {picSet, UPLOAD_STATIC_PATH} from "../../common/consts";
import path = require("path");
import * as fs from "fs";
import {ResponseSchema} from "../../response/response";
import {checkParams} from "../../common/utils";
import {upAvatarSchema} from "./upload-schema";
import * as formidable from "formidable";

const upload = new Router

upload.post(upAvatarUrl, async ctx => {
  await checkParams(ctx, upAvatarSchema, ctx.request.files, 1001)
  const file = ctx.request.files!.file as formidable.File
  let {base, ext} = path.parse(file.path)
  if (!picSet.has(ext.toLowerCase())) {
    fs.unlink(file.path, () => 1)
    return ctx.body = new ResponseSchema({message: '只允许上传图片', status: 1002})
  }
  ctx.body = new ResponseSchema({message: '上传成功', data: UPLOAD_STATIC_PATH + base})
})

export default upload
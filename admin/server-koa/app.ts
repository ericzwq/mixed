import Koa = require('koa')
import bodyParser = require('koa-body')
import morgan = require('koa-morgan')
import fs = require('fs')
import path = require('path')
import client from './redis/redis'
import router from './router/router'
import session = require('koa-session')
import assets = require('koa-static')
import sessionConfig from './session/session'
import {SessionData} from './router/user/user-types'
import {loginUrl, noLoginUrlSet, registerUrl} from './router/urls'
import {UPLOAD_PATH} from './common/consts'

const app = new Koa()
const stream = fs.createWriteStream(path.join(__dirname, './log/access.log'))

app.use(assets(path.resolve(__dirname, './uploads')))
app.use(morgan('combined', {stream}))

app.keys = ['some secret hurr']  // 这个是配合signed属性的签名key
app.use(session(sessionConfig, app))

app.use(async (context, next) => {
  console.log(context.request.path)
  context.set('Access-Control-Allow-Origin', '*')
  context.set('Access-Control-Allow-Credentials', 'true')
  context.set('Access-Control-Allow-Headers', 'Content-Type,content-type')
  context.set('Access-Control-Allow-Methods', 'DELETE,PUT,POST,GET,OPTIONS,PATCH')
  // context.set('Set-Cookie', 'session-id=138-7943785-1993852; Path=/; Domain=localhost; Expires=Fri, 10-Mar-2023 03:15:28 GMT;')
  await next()
})
// 登录校验
app.use(async (context, next) => {
  if (!(context.session as SessionData).login && !noLoginUrlSet.has(context.request.path.slice(1))) return context.body = {message: '未登录', status: 401, data: false}
  await next()
})
app.use(bodyParser({
  multipart: true, formidable: {
    keepExtensions: true,
    uploadDir: path.resolve(__dirname, UPLOAD_PATH)
  }
}))

app.use(router.routes()).use(router.allowedMethods())
const PORT = 5000

;(async () => {
  await client.connect()
  app.listen(PORT, () => console.log('server is start at post: ' + PORT))
})()

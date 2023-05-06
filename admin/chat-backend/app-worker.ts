import Koa = require('koa')
import sslify = require('koa-sslify')
import bodyParser = require('koa-body')
import morgan = require('koa-morgan')
import fs = require('fs')
import path = require('path')
import client from './redis/redis'
import router from './router/router'
import session = require('koa-session')
import assets = require('koa-static')
import https = require('https')
import sessionConfig from './session/session'
import {User} from './router/user/user-types'
import {noLoginUrlSet} from './router/urls'
import {UPLOAD_PATH} from './common/consts'
import {sqlMiddleware} from './db'
import {ResponseSchema} from './response/response'
import socket from './socket/socket'

export default (port: number) => {
  const app = new Koa()
  // todo wss
  app.use(sslify.default())
  // const server = https.createServer({}, app.callback())
  const server = https.createServer({
    key: fs.readFileSync('./https/6414388_www.wanqiang.top.key'),
    cert: fs.readFileSync('./https/6414388_www.wanqiang.top.pem')
  }, app.callback())

  app.use(assets(path.resolve(__dirname, './public'), {maxAge: 400000000}))

  const stream = fs.createWriteStream(path.join(__dirname, './log/access.log'))
  app.use(morgan('combined', {stream}))

  const wss = socket(server) // todo wss

  app.keys = ['some secret hurr']  // 这个是配合signed属性的签名key
  app.use(session(sessionConfig, app))

  process.on('message', (e, handler) => {
    console.log(e, process.pid)
    wss.emit('connection', handler as any)
  })

  app.use(async (context, next) => {
    console.log(context.request.url)
    context.set('Access-Control-Allow-Origin', '*')
    context.set('Access-Control-Allow-Credentials', 'true')
    context.set('Access-Control-Allow-Headers', 'Content-Type,content-type')
    context.set('Access-Control-Allow-Methods', 'DELETE,PUT,POST,GET,OPTIONS,PATCH')
    // context.set('Set-Cookie', 'session-id=138-7943785-1993852; Path=/; Domain=localhost; Expires=Fri, 10-Mar-2023 03:15:28 GMT;')
    await next()
  })
  // 登录校验
  app.use(async (context, next) => {
    if (!(context.session as User).login && !noLoginUrlSet.has(context.request.path.slice(1))) return context.body = {message: '未登录', status: 401, data: false}
    await next()
  })

  app.use(sqlMiddleware)

  app.use(bodyParser({
    multipart: true, formidable: {
      keepExtensions: true,
      uploadDir: path.resolve(__dirname, UPLOAD_PATH)
    }
  }))

  app.use(async (ctx, next) => {
    try {
      await next()
    } catch (e) {
      // console.log(e)
      if (ctx.body === undefined) ctx.body = new ResponseSchema({message: '未知异常', status: 777})
    }
  })

  app.use(router.routes()).use(router.allowedMethods())
  // const PORT = 5000

  ;(async () => {
    await client.connect()
    server.listen(port, () => console.log('server is start at post: ' + port, process.pid))
  })()
}

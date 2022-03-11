import Koa = require('koa')
import bodyParser = require('koa-bodyparser')
import morgan = require('koa-morgan')
import fs = require('fs')
import path = require('path')
import client from './redis/redis'
import router from './router/router'
import session = require('koa-session')
import sessionConfig from './session/session'

const app = new Koa()
const stream = fs.createWriteStream(path.join(__dirname, './log/access.log'))

app.use(morgan('combined', {stream}))

app.keys = ['some secret hurr']  // 这个是配合signed属性的签名key
app.use(session(sessionConfig, app))

app.use(async (context, next) => {
  // context.session!.save()
  // console.log(context.session!.maxAge = 600000)
  context.cookies.set('test', 'value', {
    store: {

    }
  })
  console.log(context.cookies.get('test'))
  context.set('Access-Control-Allow-Origin', '*')
  context.set('Access-Control-Allow-Credentials', 'true')
  context.set('Access-Control-Allow-Headers', 'Content-Type,content-type')
  context.set('Access-Control-Allow-Methods', 'DELETE,PUT,POST,GET,OPTIONS,PATCH')
  // context.set('Set-Cookie', 'session-id=138-7943785-1993852; Path=/; Domain=localhost; Expires=Fri, 10-Mar-2023 03:15:28 GMT;')
  await next()
})
app.use(bodyParser())

app.use(router.routes()).use(router.allowedMethods())
const PORT = 5000

;(async () => {
  await client.connect()
  app.listen(PORT, () => console.log('server is start at post: ' + PORT))
})()

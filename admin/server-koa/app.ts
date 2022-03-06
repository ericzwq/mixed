import Koa = require('koa')
import bodyParser = require('koa-bodyparser')
import morgan = require('koa-morgan')
import router from './router/router'
import fs = require('fs')
import path = require('path')

const app = new Koa()
const stream = fs.createWriteStream(path.join(__dirname, './log/access.log'))

app.use(morgan('combined', {stream}))
app.use(async (context, next) => {
  context.set('Access-Control-Allow-Origin', '*')
  context.set('Access-Control-Allow-Credentials', 'true')
  context.set('Access-Control-Allow-Headers', 'Content-Type,content-type')
  context.set('Access-Control-Allow-Methods', 'DELETE,PUT,POST,GET,OPTIONS,PATCH')
  await next()
})
app.use(bodyParser())

app.use(router.routes()).use(router.allowedMethods())
const PORT = 5000
app.listen(PORT, () => console.log('server is start at post: ' + PORT))

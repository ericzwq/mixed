import Koa = require('koa')
import cluster = require('cluster')
import os = require('os')
import morgan = require('koa-morgan')
import assets = require('koa-static')
import sslify = require('koa-sslify')
import fs = require('fs')
import path = require('path')
import WebSocket = require('ws')
import cp = require('child_process')
import https = require('https')
import net = require('net')
import appWorker from './app-worker'
import {isProd} from './common/consts'

const PORT = 5000
const workers = [] as cluster.Worker[]
// console.log(cluster)
if ((cluster as any).isMaster) {
  const app = master()
  // const handle = (net as any)._createServerHandle('127.0.0.1', 3000)
  net.createServer(function (socket) {
    console.log(arguments)
    workers[0].send('hello', socket)
  }).listen(PORT)
  for (let i = 0, l = isProd ? os.cpus().length : 1; i < l; i++) {
    workers.push((cluster as any).fork())
  }
  // setTimeout(() => workers[0].send('hello', app as any), 5000)
} else {
  appWorker(PORT + (cluster as any).worker.id)
}

function master() {
  const app = new Koa()
  app.use(sslify.default())
  const server = https.createServer({
    key: fs.readFileSync('./https/6414388_www.wanqiang.top.key'),
    cert: fs.readFileSync('./https/6414388_www.wanqiang.top.pem')
  }, app.callback())

  app.use(assets(path.resolve(__dirname, './public'), {maxAge: 400000000}))

  const logPath = path.join(__dirname, './log/access.log')
  try {
    fs.accessSync(logPath)
  } catch (e) {
    fs.mkdirSync(path.join(__dirname, './log'))
  }
  const stream = fs.createWriteStream(logPath)
  app.use(morgan('combined', {stream}))

  app.use(function () {
    console.log('有请求')
  })

  const wss = new WebSocket.WebSocketServer({server})
  wss.on('connection', async (ws, req) => {
    console.log('有用户连接', process.pid)
  })

  // server.listen(PORT, () => console.log('server is start at post: ' + PORT, process.pid))
  return app
}

import {Server} from 'https'
import WebSocket = require('ws')
import client from '../redis/redis'
import {SessionData} from '../router/user/user-types'
import {sessionKey} from '../session/session'
import {SocketResponseSchema} from '../response/response'
import socketConnRouter from './socket-conn-router'


function getSession(cookie?: string) {
  return cookie?.match(new RegExp(sessionKey + '=([^;]+);'))?.[1].trim() ?? ''
}

export default (server: Server) => {
  const wss = new WebSocket.WebSocketServer({server})
  wss.on('connection', async (ws, req) => {
    let _cookie = req.headers.cookie || decodeURIComponent(req.url?.match(/cookie=(.+?)&?$/)?.[1] || '')
    const cookie = getSession(_cookie)
    const session = JSON.parse(await client.get(cookie) || '{}') as SessionData
    if (!session.login) return ws.send(JSON.stringify(new SocketResponseSchema({message: '未登录', status: 401, action: ''})))
    console.log('有用户连接', session, wss.clients.size, req.url)
    return socketConnRouter(session, cookie, ws, req)
  })
  return wss
}

// var net = require('net');
// var server = net.createServer();
// server.on('connection', function (socket: any) {
//     console.log('有客户连接成功了。');
// })
// server.listen(5000, '127.0.0.1', () => console.log('http//127.0.0.1:3000 启动Socket服务器'))

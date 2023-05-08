import {Server} from 'https'
import WebSocket = require('ws')
import client from '../redis/redis'
import {User} from '../router/user/user-types'
import {sessionKey} from '../session/session'
import socketConnectionRouter from './socket-connection-router'
import {SocketResponseOptions, SocketResponseSchema} from '../response/response'
import {ExtWebSocket} from "./socket-types";


function getSession(cookie?: string) {
  return cookie?.match(new RegExp(sessionKey + '=([^;]+);'))?.[1].trim() ?? ''
}

/*export const phoneMap = {} as { [key in string]: WebSocket }*/ // todo
export default (server: Server) => {
  const wss = new WebSocket.WebSocketServer({server})
  wss.on('connection', async (ws: ExtWebSocket, req) => {
    // 扩展方法
    ws.json = (socketResponseOptions: SocketResponseOptions, options, cb) => ws.send(JSON.stringify(new SocketResponseSchema(socketResponseOptions)), options, cb)
    let _cookie = req.headers.cookie || decodeURIComponent(req.url?.match(/cookie=(.+?)&?$/)?.[1] || '')
    // todo phone
    /*let phone = req.url?.match(/phone=(.+?)&?$/)?.[1] || ''
    phoneMap[phone] = ws*/
    const cookie = getSession(_cookie)
    const session = JSON.parse(await client.get(cookie) || '{}') as User
    if (!session.login) return ws.json({message: '未登录', status: 401, action: ''})
    console.log('有用户连接', session, wss.clients.size, req.url)
    return socketConnectionRouter.handler(session, cookie, ws, req)
  })
  return wss
}

// var net = require('net');
// var server = net.createServer();
// server.on('connection', function (socket: any) {
//     console.log('有客户连接成功了。');
// })
// server.listen(5000, '127.0.0.1', () => console.log('http//127.0.0.1:3000 启动Socket服务器'))

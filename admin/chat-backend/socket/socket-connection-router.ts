import {IncomingMessage} from 'http'
import WebSocket = require('ws')
import {SocketResponseSchema} from '../response/response'
import {SessionData} from '../router/user/user-types'
import {ConnectionHandler, ConnectionHandlerMap} from './socket-types'
import {handleMessage} from "./message/socket-message-router";
import {voice} from "./voice/socket-voice-router";


const socketConnectionRouter = {
  connectionHandlerMap: {} as ConnectionHandlerMap,
  handler(session: SessionData, cookie: string, ws: WebSocket.WebSocket, req: IncomingMessage) {
    const [pathname, query] = req.url!.split('?')
    const params = query ? query.split('&').reduce((acc, cur) => {
      const [name, value] = cur.split('=')
      acc[name] = value
      return acc
    }, {} as { [key in string]: string }) : {}
    console.log(pathname, params)
    const handler = this.connectionHandlerMap[pathname.slice(1)]
    if (handler) handler?.(session, cookie, ws, req, params)
    else ws.send(new SocketResponseSchema({status: 1001, message: '未知的请求地址'}).toString())
  },
  addHandler(connection: string, handler: ConnectionHandler) {
    this.connectionHandlerMap[connection] = handler
  },
  addHandlers(routes: { connection: string, handler: ConnectionHandler }[]) {
    for (const route of routes) {
      this.connectionHandlerMap[route.connection] = route.handler
    }
  }
}

socketConnectionRouter.addHandler('', handleMessage)
socketConnectionRouter.addHandler('voice', voice)

export default socketConnectionRouter
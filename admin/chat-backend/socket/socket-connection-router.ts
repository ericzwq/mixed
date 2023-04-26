import {IncomingMessage} from 'http'
import {SessionData} from '../router/user/user-types'
import {ConnectionHandler, ConnectionHandlerMap, ExtWebSocket} from './socket-types'
import {handleMessage} from "./message/socket-message-router";
import {voice} from "./voice/socket-voice-router";


const socketConnectionRouter = {
  connectionHandlerMap: {} as ConnectionHandlerMap,
  handler(session: SessionData, cookie: string, ws: ExtWebSocket, req: IncomingMessage) {
    const [pathname, query] = req.url!.split('?')
    const params = query ? query.split('&').reduce((acc, cur) => {
      const [name, value] = cur.split('=')
      acc[name] = value
      return acc
    }, {} as { [key in string]: string }) : {}
    console.log(pathname, params)
    const handler = this.connectionHandlerMap[pathname.slice(1)]
    if (handler) handler?.(session, cookie, ws, req, params)
    else ws.json({status: 1001, message: '未知的请求地址'})
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
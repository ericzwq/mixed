import {SocketResponseSchema} from '../../../response/response'
import * as WebSocket from 'ws'
import {SessionData} from '../../../router/user/user-types'
import {getContactsByUsername} from './contact-sql'
import {RequestMessage} from '../../socket-types'

export async function getContacts(ws: WebSocket.WebSocket, session: SessionData, data: RequestMessage) {
  const {result} = await getContactsByUsername(session)
  ws.send(new SocketResponseSchema({data: result, action: data.action}).toString())
}

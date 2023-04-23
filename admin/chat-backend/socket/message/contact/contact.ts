import {SocketResponseSchema} from '../../../response/response'
import * as WebSocket from 'ws'
import {SessionData} from '../../../router/user/user-types'
import {getContactsByUsername} from './contact-sql'
import {RequestMessage} from '../../socket-types'

export async function getContacts(ws: WebSocket.WebSocket, session: SessionData, data: RequestMessage) {
  const [{result: r1}, {result: r2}] = await getContactsByUsername(session)
  const noDelFlags = ['0', '2']
  ws.send(JSON.stringify(new SocketResponseSchema(
      {
        data: r1.filter(v => noDelFlags.includes(v.status[0])).concat(r2.filter(v => noDelFlags.includes(v.status[1]))),
        action: data.action
      }
    ))
  )
}

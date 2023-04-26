import {SessionData} from '../../../router/user/user-types'
import {getContactsByUsername} from './contact-sql'
import {ExtWebSocket, RequestMessage} from '../../socket-types'

export async function getContacts(ws: ExtWebSocket, session: SessionData, data: RequestMessage) {
  const {result} = await getContactsByUsername(session)
  ws.json({data: result, action: data.action})
}

import {User} from '../../../router/user/user-types'
import {getContactsByUsername} from './contact-sql'
import {ExtWebSocket, RequestMessage} from '../../socket-types'

export async function getContacts(ws: ExtWebSocket, session: User, data: RequestMessage) {
  const {result} = await getContactsByUsername(ws, session)
  ws.json({data: result, action: data.action})
}

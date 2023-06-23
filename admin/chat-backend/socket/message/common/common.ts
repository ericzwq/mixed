// 获取消息
import {checkMessageParams} from '../../../common/utils'
import {ExtWebSocket, RequestMessage} from '../../socket-types'
import {getMsgsByIdSchema} from './common-schems'
import {User} from '../../../router/user/user-types'
import {ChatType, GetMsgsByIdReq} from './common-types'
import {SgMsgRes} from '../single/single-types'
import {GpMsgRes} from '../group/group-types'
import {selectSgMsgById} from '../single/single-sql'
import {selectGpMsgById} from '../group/group-sql'

// 根据id列表获取消息
export async function getMsgsById(ws: ExtWebSocket, user: User, data: RequestMessage<GetMsgsByIdReq>) {
  const {action, data: body} = data
  await checkMessageParams(ws, getMsgsByIdSchema, body, 1001)
  const res: any = []
  for (const {id, chatType} of body.data) {
    const {result} = (await (chatType === ChatType.single ? selectSgMsgById(ws, id) : selectGpMsgById(ws, id)))
    if (!result.length) return ws.json({action, message: '消息' + id + '不存在', status: 1002})
    res.push(result[0])
  }
  ws.json({action, data: {data: res, fakeId: body.fakeId}})
}

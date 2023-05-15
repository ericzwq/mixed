import {User} from '../../../router/user/user-types'
import {ExtWebSocket, MsgRead, MsgStatus, MsgType, RequestMessage} from '../../socket-types'
import {checkMessageParams, formatDate, handleAudio} from '../../../common/utils'
import {
  addSgMsg,
  selectHisSgMsgs,
  selectLastSgMsg,
  selectNewSgMsgs,
  selectSgMsgByFakeId,
  selectSgMsgByIdAndFrom,
  updateSgMsgNext, updateSgMsgsRead,
  updateSgMsgStatus
} from './single-sql'
import {REC_SG_MSGS, REC_READ_SG_MSGS} from '../../socket-actions'
import {getHisSgMsgsSchema, readSgMsgSchema, sgMsgSchema} from './single-schema'
import {GetHisSgMsgReq, ReadSgMsg, SgMsgReq, SgMsgRes, SgMsgs} from './single-types'
import {beginSocketSql} from '../../../db'

export const usernameClientMap = {} as { [key in string]?: ExtWebSocket }

export async function sendSgMsg(ws: ExtWebSocket, session: User, data: RequestMessage<SgMsgReq>) {
  await checkMessageParams(ws, sgMsgSchema, data.data, 1001)
  const body = data.data
  const from = session.username
  const createdAt = formatDate()
  const {type} = body
  if (type === MsgType.audio) handleAudio(body, createdAt) // 音频
  const {result} = await selectSgMsgByFakeId(ws, body.fakeId)
  if (result.length) return ws.json({status: 1004, message: 'fakeId重复'})
  const {result: result2} = await selectLastSgMsg(ws, body.lastId!, from, body.to)
  if (!result2.length) return ws.json({status: 1005, message: 'lastId错误'})
  await beginSocketSql(ws)
  if (type === MsgType.retract) await handleRetract(ws, body, session.username)
  let lastMsg = result2[0]
  const messages: SgMsgRes[] = JSON.parse((await selectNewSgMsgs(ws, lastMsg.id)).result[0][0].messages)
  if (messages.length > 0) lastMsg = messages[messages.length - 1]
  body.pre = lastMsg.id
  const {result: {insertId}} = await addSgMsg(ws, from, body, createdAt)
  await updateSgMsgNext(ws, insertId, lastMsg.id)
  if (messages.length > 0) lastMsg.next = insertId
  messages.push({
    id: insertId,
    pre: body.pre,
    next: null,
    status: MsgStatus.normal,
    content: body.content,
    type,
    fakeId: body.fakeId,
    from,
    to: body.to,
    createdAt,
    read: MsgRead.no
  })
  const res = {
    data: messages,
    action: REC_SG_MSGS
  }
  ws.json(res) // 给自己返回消息
  usernameClientMap[body.to]?.json(res) // 给好友发送消息
}

// 获取历史消息
export async function getHisSgMsgs(ws: ExtWebSocket, session: User, data: RequestMessage<GetHisSgMsgReq>) {
  await checkMessageParams(ws, getHisSgMsgsSchema, data.data, 1007)
  const {result} = await selectHisSgMsgs(ws, data.data)
  ws.json({action: data.action, data: JSON.parse(result[0][0].messages)})
}

// 处理撤回
async function handleRetract(ws: ExtWebSocket, message: SgMsgReq, from: SgMsgs.From) {
  const handler = async () => {
    const id = message.content as number
    const {result} = await selectSgMsgByIdAndFrom(ws, id, from)
    if (!result.length) return ws.json({message: 'content不匹配', status: 1009})
    const {createdAt, status} = result[0]
    if (status === MsgStatus.retract) return ws.json({message: '该消息已撤回', status: 1012})
    if (Date.now() - new Date(createdAt).getTime() > 120000) return ws.json({message: '超过2分钟无法撤回', status: 1010})
    const {result: result2} = await updateSgMsgStatus(ws, id, MsgStatus.retract)
    if (result2.changedRows === 0) return ws.json({message: '撤回失败', status: 1011})
    return true
  }
  if (await handler() !== true) return Promise.reject()
}

// 消息已读
export async function readSgMsgs(ws: ExtWebSocket, session: User, data: RequestMessage<ReadSgMsg>) {
  await checkMessageParams(ws, readSgMsgSchema, data.data, 1013)
  const {ids, to} = data.data
  const {result} = await updateSgMsgsRead(ws, ids, session.username, to)
  ws.json({action: data.action, data: {ids, count: result.changedRows}})
  result.changedRows > 0 && usernameClientMap[to]?.json({action: REC_READ_SG_MSGS, data: {ids, count: result.changedRows}})
}
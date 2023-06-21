import {User, Users} from '../../../router/user/user-types'
import {ExtWebSocket, MsgRead, MsgStatus, MsgType, RequestMessage} from '../../socket-types'
import {checkMessageParams, formatDate, handleAudio} from '../../../common/utils'
import {
  addSgMsg,
  selectHisSgMsgs,
  selectLastSgMsg,
  selectNewSgMsgs,
  selectSgMsgByFakeId,
  selectSgMsgByIdAndFrom,
  selectSgMsgReadsById,
  updateSgMsgNext,
  updateSgMsgRead,
  updateSgMsgStatus
} from './single-sql'
import {REC_READ_SG_MSGS, REC_SG_MSGS} from '../../socket-actions'
import {getHisSgMsgsSchema, readSgMsgSchema, sendSgMsgSchema, transmitSgMsgsSchema} from './single-schema'
import {GetHisSgMsgReq, ReadSgMsgsReq, SendSgMsgReq, TransmitSgMsgsReq, SgMsgRes, SgMsgs} from './single-types'
import {beginSocketSql} from '../../../db'
import client from "../../../redis/redis";
import {selectContactBySub} from "../contact/contact-sql";
import {Contacts} from "../contact/contact-types";
import Status = Contacts.Status;

export const usernameClientMap = {} as { [key in string]?: ExtWebSocket }

export async function sendSgMsg(ws: ExtWebSocket, user: User, data: RequestMessage<SendSgMsgReq>) {
  await checkMessageParams(ws, sendSgMsgSchema, data.data, 1001)
  const body = data.data
  const from = user.username
  const createdAt = formatDate()
  const {type, to, fakeId, lastId} = body
  const {action} = data
  if (!(await checkContactStatus(ws, from, to, action))) return
  const {result} = await selectSgMsgByFakeId(ws, fakeId)
  if (result.length) return ws.json({action, status: 1004, message: 'fakeId重复'})
  const {result: result2} = await selectLastSgMsg(ws, lastId!, from, to)
  if (!result2.length) return ws.json({action, status: 1005, message: 'lastId错误'})
  await beginSocketSql(ws)
  if (type === MsgType.audio) handleAudio(body, createdAt) // 音频
  if (type === MsgType.retract) await handleRetract(ws, body, from)
  let lastMsg = result2[0]
  const messages: SgMsgRes[] = JSON.parse((await selectNewSgMsgs(ws, lastMsg.id)).result[0][0].messages)
  if (messages.length > 0) lastMsg = messages[messages.length - 1]
  body.pre = lastMsg.id
  const {result: {insertId}} = await addSgMsg(ws, from, to, body, body.pre, createdAt)
  await updateSgMsgNext(ws, insertId, lastMsg.id)
  if (messages.length > 0) lastMsg.next = insertId
  const message: SgMsgRes = {
    id: insertId,
    pre: body.pre,
    next: null,
    status: MsgStatus.normal,
    content: body.content,
    type,
    fakeId,
    from,
    to,
    createdAt,
    read: MsgRead.no
  }
  messages.push(message)
  ws.json({data: messages, action: REC_SG_MSGS}) // 给自己返回消息
  usernameClientMap[body.to]?.json({data: [message], action: REC_SG_MSGS}) // 给好友发送消息
}

async function checkContactStatus(ws: ExtWebSocket, from: Users.Username, to: Users.Username, action: string) {
  if (to !== from) {
    const contactStatus = await getUserContactStatus(ws, from, to)
    if (contactStatus !== Status.normal) {
      if (contactStatus === Status.never) return ws.json({action, status: 1002, message: '你们不是好友'})
      if (contactStatus === Status.blackList) return ws.json({action, status: 1003, message: '对方已将你拉黑'})
      return ws.json({action, status: 1008, message: '对方已将你删除'})
    }
  }
  return true
}

// 逐条转发消息
export async function transmitSgMsgs(ws: ExtWebSocket, user: User, data: RequestMessage<TransmitSgMsgsReq>) {
  const body = data.data
  await checkMessageParams(ws, transmitSgMsgsSchema, body, 1001)
  console.log(data.action, body)
  const from = user.username
  const createdAt = formatDate()
  const {lastId, to, msgs} = body
  const {action} = data
  if (!(await checkContactStatus(ws, from, to, action))) return
  const {result: result2} = await selectLastSgMsg(ws, lastId!, from, to)
  if (!result2.length) return ws.json({action, status: 1005, message: 'lastId错误'})
  let lastMsg = result2[0]
  const messages: SgMsgRes[] = JSON.parse((await selectNewSgMsgs(ws, lastMsg.id)).result[0][0].messages)
  if (messages.length > 0) lastMsg = messages[messages.length - 1]
  await beginSocketSql(ws)
  let fakeIdRepeat = false
  let pre: SgMsgs.Pre
  const newMsgs: SgMsgRes[] = []
  let i = 0
  for (const msg of msgs) {
    const {fakeId, content, type} = msg
    const {result} = await selectSgMsgByFakeId(ws, fakeId)
    if (result.length) {
      fakeIdRepeat = true
      ws.json({action, status: 1004, message: 'fakeId重复'})
      break
    }
    pre = lastMsg.id
    const {result: {insertId}} = await addSgMsg(ws, from, to, msg, pre, createdAt)
    await updateSgMsgNext(ws, insertId, lastMsg.id)
    if ((i++ === 0 && messages.length > 0) || i > 0) lastMsg.next = insertId
    const message: SgMsgRes = {
      id: insertId,
      pre,
      next: null,
      status: MsgStatus.normal,
      content,
      type,
      fakeId,
      from,
      to,
      createdAt,
      read: MsgRead.no
    }
    newMsgs.push(message)
    lastMsg = message
  }
  if (fakeIdRepeat) return Promise.reject('单聊：fakeId重复')
  ws.json({data: messages.concat(newMsgs), action: REC_SG_MSGS}) // 给自己返回消息
  usernameClientMap[body.to]?.json({data: newMsgs, action: REC_SG_MSGS}) // 给好友发送消息
}

// 获取历史消息
export async function getHisSgMsgs(ws: ExtWebSocket, user: User, data: RequestMessage<GetHisSgMsgReq>) {
  await checkMessageParams(ws, getHisSgMsgsSchema, data.data, 1007)
  const {result} = await selectHisSgMsgs(ws, data.data)
  ws.json({action: data.action, data: JSON.parse(result[0][0].messages)})
}

// 处理撤回
async function handleRetract(ws: ExtWebSocket, message: SendSgMsgReq, from: SgMsgs.From) {
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
  if (await handler() !== true) return Promise.reject('撤回消息异常')
}

// 消息已读
export async function readSgMsgs(ws: ExtWebSocket, user: User, data: RequestMessage<ReadSgMsgsReq>) {
  await checkMessageParams(ws, readSgMsgSchema, data.data, 1013)
  await beginSocketSql(ws)
  const {ids, to} = data.data
  const from = user.username
  const readIds: SgMsgs.Id[] = []
  for (const id of ids) {
    const {result} = await selectSgMsgReadsById(ws, id, from, to)
    if (!result.length || result[0].read === MsgRead.yes) continue
    await updateSgMsgRead(ws, id, from)
    readIds.push(id)
  }
  ws.json({action: data.action, data: {ids: readIds, from}})
  usernameClientMap[to]?.json({action: REC_READ_SG_MSGS, data: {ids: readIds, from}})
}

// 获取用户和目标用户的好友关系
async function getUserContactStatus(ws: ExtWebSocket, from: Users.Username, to: Users.Username) {
  let _status = await client.get('contact-' + from + '-' + to)
  let status: Status
  if (_status == null) {
    const {result} = await selectContactBySub(ws, to, from)
    status = result.length ? result[0].status : Status.never
    await client.set('contact-' + from + '-' + to, status)
  } else status = +_status
  return status
}
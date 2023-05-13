import fs = require('fs')
import path = require('path')
import {User} from '../../../router/user/user-types'
import {ExtWebSocket, MsgRead, MsgStatus, MsgType, RequestMessage} from '../../socket-types'
import {checkMessageParams, formatDate} from '../../../common/utils'
import {
  addGroupMessage,
  addSgMsg,
  selectHisSgMsgs,
  selectLastSgMsg,
  selectNewSgMsgs,
  selectSgMsgByFakeId,
  selectSgMsgByIdAndFrom,
  updateSgMsgNext, updateSgMsgsRead,
  updateSgMsgStatus
} from './chat-sql'
import {REC_MSGS, REC_READ_SG_MSGS} from '../../socket-actions'
import {getGroupById, isUserInGroup} from '../group/group'
import {getHisSgMsgsSchema, readSgMsgSchema, sgMsgSchema} from './chat-schema'
import {GetHisSgMsgReq, ReadSgMsg, SgMsgReq, SgMsgRes, SgMsgs} from './chat-types'
import {beginSocketSql} from '../../../db'

export const usernameClientMap = {} as { [key in string]?: ExtWebSocket }

export async function sendMessage(ws: ExtWebSocket, session: User, data: RequestMessage<SgMsgReq>) {
  await checkMessageParams(ws, sgMsgSchema, data.data, 1001)
  const body = data.data
  const [type, to] = body.target.split('-')
  if (!type || !to) return ws.json({message: '参数target非法', status: 1002, action: ''})
  body.from = session.username
  body.to = to
  switch (type) {
    case '1': // 单聊
      await singleChat(ws, body, session)
      break
    case '2': // 群聊
      await groupChat(ws, body, session)
      break
    default:
      return ws.json({message: '参数target非法', status: 1003, action: ''})
  }
}

// 获取历史消息
export async function getHisSgMsgs(ws: ExtWebSocket, session: User, data: RequestMessage<GetHisSgMsgReq>) {
  await checkMessageParams(ws, getHisSgMsgsSchema, data.data, 1007)
  const {result} = await selectHisSgMsgs(ws, data.data)
  ws.json({action: data.action, data: JSON.parse(result[0][0].messages)})
}

// 处理音频
function handleAudio(message: SgMsgReq, createdAt: SgMsgs.CreatedAt) {
  const uint8Array = new Uint8Array(message.content as [])
  const urlDir = '/staging/' + createdAt.slice(0, -9) + '/'
  const dir = path.resolve(__dirname, '../public' + urlDir)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
  const filename = Date.now() + '' + Math.random() + (message.ext || '.webm')
  fs.writeFileSync(path.resolve(dir, filename), uint8Array)
  message.content = urlDir + filename // 文件内容保存为地址
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

async function singleChat(ws: ExtWebSocket, message: SgMsgReq, session: User) { // 单聊
  const createdAt = formatDate()
  const {type} = message
  if (type === MsgType.audio) handleAudio(message, createdAt) // 音频
  message.createdAt = createdAt
  const {result} = await selectSgMsgByFakeId(ws, message.fakeId)
  if (result.length) return ws.json({status: 1004, message: 'fakeId重复'})
  const {result: result2} = await selectLastSgMsg(ws, message.lastId, message.from, message.to)
  if (!result2.length) return ws.json({status: 1005, message: 'lastId错误'})
  await beginSocketSql(ws)
  if (type === MsgType.retract) await handleRetract(ws, message, session.username)
  let lastMsg = result2[0]
  const messages: SgMsgRes[] = JSON.parse((await selectNewSgMsgs(ws, lastMsg.id)).result[0][0].messages)
  if (messages.length > 0) lastMsg = messages[messages.length - 1]
  message.pre = lastMsg.id
  const {result: {insertId}} = await addSgMsg(ws, message)
  await updateSgMsgNext(ws, insertId, lastMsg.id)
  if (messages.length > 0) lastMsg.next = insertId
  messages.push({
    id: insertId,
    pre: message.pre,
    next: null,
    status: MsgStatus.normal,
    content: message.content,
    type,
    fakeId: message.fakeId,
    from: session.username,
    to: message.to,
    createdAt,
    read: MsgRead.no
  })
  const data = {
    data: messages,
    action: REC_MSGS
  }
  ws.json(data) // 给自己返回消息
  usernameClientMap[message.to]?.json(data) // 给好友发送消息
}

// 消息已读
export async function readSgMsgs(ws: ExtWebSocket, session: User, data: RequestMessage<ReadSgMsg>) {
  await checkMessageParams(ws, readSgMsgSchema, data.data, 1013)
  const {ids, to} = data.data
  const {result} = await updateSgMsgsRead(ws, ids, session.username, to)
  ws.json({action: data.action, data: {ids, count: result.changedRows}})
  result.changedRows > 0 && usernameClientMap[to]?.json({action: REC_READ_SG_MSGS, data: {ids, count: result.changedRows}})
}

async function groupChat(ws: ExtWebSocket, message: SgMsgReq, session: User) { // 群聊
  const group = await getGroupById(ws, message.to)
  const {username} = session
  if (!isUserInGroup(username, group)) return ws.json({status: 1006, message: '您不在群内'})
  const createdAt = formatDate()
  if (message.type === MsgType.audio) handleAudio(message, createdAt) // 音频
  message.createdAt = createdAt
  const data = {
    data: [{data: message.content, type: message.type, fakeId: message.fakeId, from: session.username, to: message.to, createdAt}],
    action: REC_MSGS
  }
  await addGroupMessage(message)
  usernameClientMap[group.leader]?.json(data)
  group.managers.forEach(manager => usernameClientMap[manager]?.json(data))
  group.members.forEach(member => usernameClientMap[member]?.json(data))
}

import fs = require('fs')
import path = require('path')
import {User} from '../../../router/user/user-types'
import {ExtWebSocket, RequestMessage} from '../../socket-types'
import {checkMessageParams, formatDate, log} from '../../../common/utils'
import {addGroupMessage, addSgMsg, selectNewSgMsgsById, selectSgMsgByFakeId, selectLastSgMsg, updateSgMsgNext} from './chat-sql'
import {REC_MSGS} from '../../socket-actions'
import {getGroupById, isUserInGroup} from '../group/group'
import {getHisSgMsgsSchema, sgMsgSchema} from './chat-schema'
import {SgMsgs, SgMsgReq, SgMsgRes, GetHisSgMsgReq} from './chat-types'
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

}

function handleAudio(message: SgMsgReq, createdAt: string) {
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

async function singleChat(ws: ExtWebSocket, message: SgMsgReq, session: User) { // 单聊
  const createdAt = formatDate()
  if (message.type === 3) handleAudio(message, createdAt) // 音频
  message.createdAt = createdAt
  const {result} = await selectSgMsgByFakeId(ws, message.fakeId)
  if (result.length) return ws.json({status: 1004, message: 'fakeId重复'})
  const {result: result2, query} = await selectLastSgMsg(ws, message.preId, message.from, message.to)
  if (!result2.length) return ws.json({status: 1005, message: 'preId错误'})
  let lastMsg = result2[0]
  const messages: SgMsgRes[] = JSON.parse((await selectNewSgMsgsById(ws, lastMsg.next)).result[0][0].messages)
  if (messages.length > 0) lastMsg = messages[messages.length - 1]
  await beginSocketSql(ws)
  message.pre = lastMsg.id
  const {result: {insertId}} = await addSgMsg(ws, message)
  await updateSgMsgNext(ws, insertId, lastMsg.id)
  if (messages.length > 0) lastMsg.next = insertId
  messages.push({
    id: insertId,
    pre: message.pre,
    next: null,
    status: SgMsgs.Status.normal,
    content: message.content,
    type: message.type,
    fakeId: message.fakeId,
    from: session.username,
    to: message.to,
    createdAt
  })
  const data = {
    data: messages,
    action: REC_MSGS
  }
  ws.json(data) // 给自己返回消息
  usernameClientMap[message.to]?.json(data) // 给好友发送消息
}

async function groupChat(ws: ExtWebSocket, message: SgMsgReq, session: User) { // 群聊
  const group = await getGroupById(ws, message.to)
  const {username} = session
  if (!isUserInGroup(username, group)) return ws.json({status: 1006, message: '您不在群内'})
  const createdAt = formatDate()
  if (message.type === 3) handleAudio(message, createdAt) // 音频
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

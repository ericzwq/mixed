import fs = require('fs')
import path = require('path')
import {User} from "../../../router/user/user-types";
import {ExtWebSocket} from "../../socket-types";
import {checkMessageParams, formatDate} from "../../../common/utils";
import {addGroupMessage, addSgMsg, selectSgMsgByFakeId, selectSgMsgById, updateSgMsgNext} from "./chat-sql";
import {REC_MSGS} from "../../socket-actions";
import {getGroupById, isUserInGroup} from "../group/group";
import {sgMsgSchema} from "./chat-schema";
import {SgMsgReq} from "./chat-types";

export const usernameClientMap = {} as { [key in string]?: ExtWebSocket }

export async function sendMessage(ws: ExtWebSocket, session: User, data: SgMsgReq) {
  await checkMessageParams(ws, sgMsgSchema, data, 1001)
  const [type, to] = data.target.split('-')
  if (!type || !to) return ws.json({message: '参数target非法', status: 1002, action: ''})
  data.from = session.username
  data.to = to
  switch (type) {
    case '1': // 单聊
      singleChat(ws, data, session)
      break
    case '2': // 群聊
      groupChat(ws, data, session)
      break
    default:
      return ws.json({message: '参数target非法', status: 1003, action: ''})
  }
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
  const {result: result2} = await selectSgMsgById(ws, message.preId)
  if (!result2.length) return ws.json({status: 1005, message: 'preId错误'})
  let msg = result2[0]
  const messages = []
  while (msg) {
    messages.push(msg);
    ({result: [msg]} = await selectSgMsgById(ws, msg.next))
  }
  messages.reverse()
  const {result: {insertId}} = await addSgMsg(ws, message)
  // todo
  await updateSgMsgNext(ws, insertId, messages[0].id)
  const data = {
    data: [{content: message.content, type: message.type, fakeId: message.fakeId, from: session.username, to: message.to, createdAt}],
    action: REC_MSGS
  }
  ws.json(data) // 给自己返回消息
  usernameClientMap[message.to]?.json(data) // 给好友发送消息
}

async function groupChat(ws: ExtWebSocket, message: SgMsgReq, session: User) { // 群聊
  const group = await getGroupById(ws, message.to)
  const {username} = session
  if (!isUserInGroup(username, group)) return ws.json({status: 1005, message: '您不在群内'})
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
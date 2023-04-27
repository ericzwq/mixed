import * as WebSocket from "ws";
import fs = require('fs')
import path = require('path')
import {SessionData} from "../../../router/user/user-types";
import {ExtWebSocket, Message} from "../../socket-types";
import {checkMessageParams, formatDate} from "../../../common/utils";
import {addGroupMessage, addSingleMessage} from "./chat-sql";
import {REC_MSGS} from "../../socket-actions";
import Joi = require('joi')
import {getGroupById, isUserInGroup} from "../group/group";

const schemas = {
  target: Joi.string().required(),
  content: Joi.required(),
  fakeId: Joi.string().required(), // 前端消息id
  type: Joi.number().required(),
  action: Joi.string().required(),
  ext: Joi.string().allow(null, ''),
}

const MessageSchema = Joi.object({
  target: schemas.target,
  content: schemas.content,
  fakeId: schemas.fakeId,
  type: schemas.type,
  action: schemas.action,
  ext: schemas.ext
})

export const usernameClientMap = {} as { [key in string]: ExtWebSocket }

export async function sendMessage(ws: ExtWebSocket, session: SessionData, data: Message) {
  await checkMessageParams(ws, MessageSchema, data, 1001)
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

function handleAudio(message: Message, createdAt: string) {
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

async function singleChat(ws: ExtWebSocket, message: Message, session: SessionData) { // 单聊
  const createdAt = formatDate()
  if (message.type === 3) handleAudio(message, createdAt) // 音频
  message.createdAt = createdAt
  await addSingleMessage(message)
  const data = {
    data: [{data: message.content, type: message.type, fakeId: message.fakeId, from: session.username, to: message.to, createdAt}],
    action: REC_MSGS
  }
  ws.json(data) // 给自己返回消息
  usernameClientMap[message.to]?.json(data) // 给好友发送消息
}

async function groupChat(ws: ExtWebSocket, message: Message, session: SessionData) { // 群聊
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
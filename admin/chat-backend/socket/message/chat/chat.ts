import * as WebSocket from "ws";
import fs = require('fs')
import path = require('path')
import {SessionData} from "../../../router/user/user-types";
import {Group, Groups, Message} from "../../socket-types";
import {checkMessageParams, formatDate} from "../../../common/utils";
import {SocketResponseSchema} from "../../../response/response";
import {addGroupMessage, addSingleMessage, selectGroupById} from "../../socket-sql";
import {RECEIVE_MSGS} from "../../socket-actions";
import Joi = require('joi')
import client from "../../../redis/redis";

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

export const usernameClientMap = {} as { [key in string]: WebSocket.WebSocket }
export const groupClientsMap = {} as { [key in string]: Group }

export async function sendMessage(ws: WebSocket.WebSocket, session: SessionData, data: Message) {
  await checkMessageParams(ws, MessageSchema, data, 1001)
  const [type, to] = data.target.split('-')
  if (!type || !to) return ws.send(new SocketResponseSchema({message: '参数target非法', status: 1002, action: ''}).toString())
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
      return ws.send(new SocketResponseSchema({message: '参数target非法', status: 1003, action: ''}).toString())
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

async function singleChat(ws: WebSocket, message: Message, session: SessionData) { // 单聊
  const createdAt = formatDate()
  if (message.type === 3) handleAudio(message, createdAt) // 音频
  message.createdAt = createdAt
  await addSingleMessage(message)
  const data = new SocketResponseSchema({
    data: [{data: message.content, type: message.type, fakeId: message.fakeId, from: session.username, to: message.to, createdAt}],
    action: RECEIVE_MSGS
  }).toString()
  ws.send(data) // 给自己返回消息
  usernameClientMap[message.to]?.send(data) // 给好友发送消息
}

async function getGroupClient(ws: WebSocket, id: Groups.Id) {
  const {result} = await selectGroupById(id)
  if (!result.length) {
    ws.send(new SocketResponseSchema({status: 1004, message: '未知的群聊id：' + id}).toString())
    return Promise.reject()
  }
  const groupClient = result[0]
  groupClient.managers = new Set(groupClient.manager!.split(','))
  groupClient.members = new Set(groupClient.member!.split(','))
  delete groupClient.manager
  delete groupClient.member
  return groupClient
}

async function groupChat(ws: WebSocket, message: Message, session: SessionData) { // 群聊
  let groupClient = groupClientsMap[message.to]
  if (!groupClient) {
    groupClient = await getGroupClient(ws, message.to)
    groupClientsMap[message.to] = groupClient
  }
  const {username} = session
  if (username !== groupClient.leader && !groupClient.managers.has(username) && !groupClient.members.has(username)) {
    return ws.send(new SocketResponseSchema({status: 1005, message: '您不在群内'}).toString())
  }
  const createdAt = formatDate()
  if (message.type === 3) handleAudio(message, createdAt) // 音频
  message.createdAt = createdAt
  const data = new SocketResponseSchema({
    data: [{data: message.content, type: message.type, fakeId: message.fakeId, from: session.username, to: message.to, createdAt}],
    action: RECEIVE_MSGS
  }).toString()
  await addGroupMessage(message)
  usernameClientMap[groupClient.leader]?.send(data)
  groupClient.managers.forEach(manager => usernameClientMap[manager]?.send(data))
  groupClient.members.forEach(member => usernameClientMap[member]?.send(data))
}
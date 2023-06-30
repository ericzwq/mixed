import {Context} from 'koa'
import {AnySchema} from 'joi'
import {ResponseSchema} from '../response/response'
import {ExtWebSocket, MsgContent, MsgStatus} from '../socket/socket-types'
import {usernameClientMap} from '../socket/message/single/single'
import {User, Users} from '../router/user/user-types'
import {ReplyContent, SendSgMsgReq, SgMsgs} from '../socket/message/single/single-types'
import client from '../redis/redis'
import {ChatLog, ChatType} from '../socket/message/common/common-types'
import {selectSgMsgById} from '../socket/message/single/single-sql'
import {selectGpMsgById} from '../socket/message/group/group-sql'
import fs = require('fs');
import path = require('path');

export const setExcelType = function (res: any) {
  // res.setHeader('Content-Type', 'application/vnd.ms-excel') // application/vnd.openxmlformats
  // res.setHeader('Content-Type', 'application/vnd.openxmlformats;charset=utf-8')
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8')
  res.setHeader('Content-Disposition', 'attachment; filename=scores.xlsx')
}

export function formatDate(date = new Date(), isShort: boolean = false) {
  const y = date.getFullYear()
  const m = date.getMonth() + 1 + ''
  const d = date.getDate() + ''
  if (!isShort) {
    const h = date.getHours() + ''
    const mi = date.getMinutes() + ''
    const s = date.getSeconds() + ''
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')} ${h.padStart(2, '0')}:${mi.padStart(2, '0')}:${s.padStart(2, '0')}`
  }
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

export function checkParams(ctx: Context, schema: AnySchema, params: any, status: number = 888) {
  const validation = schema.validate(params)
  if (validation.error) {
    ctx.body = new ResponseSchema({message: validation.error.message, status})
    console.log(validation.error.message)
    return Promise.reject(validation)
  }
  return Promise.resolve(validation)
}

export function checkMessageParams(ws: ExtWebSocket, schema: AnySchema, params: unknown, status: number = 999) {
  const validation = schema.validate(params)
  if (validation.error) {
    // if (params.type === 3) params.content = '' // 删除音频数据
    ws.json({message: validation.error.message, status, action: '', data: params})
    console.log('params error:', validation.error.message)
    return Promise.reject(validation)
  }
  return Promise.resolve(validation)
}

export function notifyUpdateUser(username: Users.Username) {
  const toClient = usernameClientMap[username]
  toClient && (toClient.shouldUpdateUser = true)
}

export function log(...data: any) {
  console.log(formatDate() + '：', ...data)
}

export function createFakeId(from: Users.Username, to: Users.Username | number) {
  return from + '-' + to + '-' + Date.now().toString(Math.floor(Math.random() * 26 + 11))
}

// 处理音频
export function handleAudio(message: Pick<SendSgMsgReq, 'content' | 'ext' | 'status'>, createdAt: SgMsgs.CreatedAt) {
  const content: MsgContent = message.status === MsgStatus.reply ? (message.content as unknown as ReplyContent).data : message.content
  const uint8Array = new Uint8Array(content as [])
  const urlDir = '/staging/' + createdAt.slice(0, -9) + '/'
  const dir = path.resolve(__dirname, '../public' + urlDir)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir)
  const filename = Date.now() + '' + Math.random() + (message.ext || '.webm')
  fs.writeFileSync(path.resolve(dir, filename), uint8Array)
  if (message.status === MsgStatus.reply) (message.content as ReplyContent).data = urlDir + filename // 文件内容保存为地址
  else message.content = urlDir + filename
}

export async function updateUser(username: Users.Username, key: keyof User, value: User[typeof key]) {
  const sessionId = await client.get(username)
  if (sessionId) {
    const toUser: User = JSON.parse((await client.get(sessionId))!)
    toUser[key] = value
    await client.set(sessionId, JSON.stringify(toUser))
  }
  notifyUpdateUser(username)
}

// 校验聊天记录里消息的真假
export async function checkChatLog(ws: ExtWebSocket, data: ChatLog) {
  const {chatType, ids} = data
  const fn = chatType === ChatType.single ? selectSgMsgById : selectGpMsgById
  for (const id of ids) {
    const {result} = await fn(ws, id, true)
    if (!result.length) return Promise.reject('消息' + id + '不存在')
  }
  return true
}

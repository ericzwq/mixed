import * as WebSocket from "ws";
import { checkMessageParams, formatDate } from "../common/utils";
import { SocketResponseSchema } from "../response/response";
import { SessionData } from "../router/user/user-types";
import { clientMap, voiceClientMap } from "./socket-conn-router";
import { RECEIVE_MSGS, VOICE_RESULT } from "./socket-actions";
import { addSingleMessage } from "./socket-sql";
import { AnswerMessage, CandidateMessage, Message, OfferMessage, VoiceResult } from "./socket-types";
import fs = require('fs');
import path = require("path");
import Joi = require("joi");
import { func } from "joi";

const schemas = {
	target: Joi.string().required(),
	content: Joi.required(),
	fackId: Joi.string().required(), // 前端消息id
	type: Joi.number().required(),
	action: Joi.string().required(),
}

const MessageSchema = Joi.object({
	target: schemas.target,
	content: schemas.content,
	fackId: schemas.fackId,
	type: schemas.type,
	action: schemas.action
})

const router: { [key in string]: (ws: WebSocket.WebSocket, session: SessionData, data: any) => void } = {
	sendMessage,
	voiceResult,
	offer,
	answer,
	candidate,
}
export default router

function voiceResult(ws: WebSocket.WebSocket, session: SessionData, data: VoiceResult) {
	clientMap.get(data.data.to)?.send(JSON.stringify(new SocketResponseSchema(data)))
}

function candidate(ws: WebSocket.WebSocket, session: SessionData, data: CandidateMessage) {
	data.status = 0
	clientMap.get(data.data.to)?.send(JSON.stringify(data))
}

function offer(ws: WebSocket.WebSocket, session: SessionData, data: OfferMessage) {
	data.status = 0
	clientMap.get(data.data.to)?.send(JSON.stringify(data))
}

function answer(ws: WebSocket.WebSocket, session: SessionData, data: AnswerMessage) {
	data.status = 0
	clientMap.get(data.data.to)?.send(JSON.stringify(data))
}

async function sendMessage(ws: WebSocket.WebSocket, session: SessionData, data: Message) {
	await checkMessageParams(ws, MessageSchema, data, 1001)
	const [type, to] = data.target.split('-')
	// const fackId = data.fackId
	if (!type || !to) return ws.send(JSON.stringify(new SocketResponseSchema({ message: '参数target非法', status: 1002, action: '' })))
	data.from = session.username
	data.to = to
	switch (type) {
		case '1': // 单聊
			singleChat(ws, data, session)
			break
		case '2': // 群聊
			groupChat(data)
			break
		default:
			return ws.send(JSON.stringify(new SocketResponseSchema({ message: '参数target非法', status: 1003, action: '' })))
	}
}

async function singleChat(ws: WebSocket, message: Message, session: SessionData) { // 单聊
	const createdAt = formatDate()
	if (message.type === 3) { // 音频
		const uint8Array = new Uint8Array(message.content as [])
		const urlDir = '/staging/' + createdAt.slice(0, -9) + '/'
		const dir = path.resolve(__dirname, '../public' + urlDir)
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir)
		}
		const filename = Date.now() + '.webm'
		fs.writeFileSync(path.resolve(dir, filename), uint8Array)
		message.content = urlDir + filename // 文件内容保存为地址
	}
	message.createdAt = createdAt
	await addSingleMessage(message)
	const { fackId } = message
	const data = JSON.stringify(new SocketResponseSchema({ data: [{ data: message.content, type: message.type, fackId, from: session.username, to: message.to, createdAt, status: 0 }], action: RECEIVE_MSGS }))
	ws.send(data) // 给自己返回消息
	clientMap.get(message.to)?.send(data) // 给好友发送消息
}

function groupChat(data: Message) { // 群聊

}
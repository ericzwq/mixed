import { IncomingMessage } from "http";
import WebSocket = require("ws");
import { formatDate } from "../common/utils";
import { SocketResponseSchema } from "../response/response";
import { SessionData, Users } from "../router/user/user-types";
import { RECEIVE_MSGS, CONN_VOICE, VOICE_RESULT } from "./socket-actions";
import { getChatData } from "./socket-sql";
import { Message } from "./socket-types";
import socketRouter from './socket-msg-router'
import client from "../redis/redis";

export default function(session: SessionData, cookie: string, ws: WebSocket.WebSocket, req: IncomingMessage) {
	const [pathname, query] = req.url!.split('?')
	const params = query ? query.split('&').reduce((acc, cur) => {
		const [name, value] = cur.split('=')
		acc[name] = value
		return acc
	}, {} as { [key in string]: string }) : {}
	console.log(pathname, params)
	router[pathname.slice(1)](session, cookie, ws, req, params)
}

const router: { [key in string]: (session: SessionData, cookie: string, ws: WebSocket.WebSocket, req: IncomingMessage, params: any) => void } = {
	'': handleMessage,
	voice
}

export const clientMap = new Map<Users.Username, WebSocket.WebSocket>()
export const voiceClientMap = new Map<Users.Username, WebSocket.WebSocket>()

async function handleMessage(session: SessionData, cookie: string, ws: WebSocket.WebSocket, req: IncomingMessage) {
	clientMap.set(session.username, ws)
	const { result } = await getChatData(session)
	ws.send(JSON.stringify(new SocketResponseSchema({ data: result, action: RECEIVE_MSGS })))

	ws.on('message', async (_data, isBinary) => {
		let data: Message
		if (isBinary) {

		} else {
			try {
				data = JSON.parse(_data.toString())
			} catch (e) {
				return console.log('数据解析失败', e)
			}
			socketRouter[data.action](ws, session, data)
		}
	})

	ws.on('error', e => {
		session.leaveTime = formatDate()
		client.set(cookie, JSON.stringify(session))
		console.log('error', e)
	})

	ws.on('close', (e) => {
		session.leaveTime = formatDate()
		client.set(cookie, JSON.stringify(session))
		console.log('close', e)
	})
}

function voice(session: SessionData, cookie: string, ws: WebSocket.WebSocket, req: IncomingMessage, params: any) {
	const username = params.username
	voiceClientMap.set(session.username, ws)
	if (!voiceClientMap.has(username)) { // 对方未连接
		console.log(username, !!clientMap.get(username))
		clientMap.get(username)?.send(JSON.stringify(new SocketResponseSchema({ action: CONN_VOICE, data: {from: session.username, to: username} })))
	} else { // 对方已连接
		clientMap.get(username)?.send(JSON.stringify(new SocketResponseSchema({ action: VOICE_RESULT, data: {from: session.username, to: username, agree: true} })))
	}
	ws.on('message', async (data, isBinary) => {
		if (!isBinary) return ws.send('请发送二进制数据')
		clientMap.get(username)?.send(data)
		console.log(data)
	})

	ws.on('error', e => {
		console.log('error', e)
	})

	ws.on('close', (e) => {
		console.log('close', e)
	})
}
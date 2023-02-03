import { Context } from 'koa'
import WebSocket = require('ws')
import { AnySchema } from 'joi'
import { ResponseSchema, SocketResponseSchema } from '../response/response'
import exp = require('constants')

export const setExcelType = function(res: any) {
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
		ctx.body = new ResponseSchema({ message: validation.error.message, status })
		console.log(validation.error.message)
		return Promise.reject(validation)
	}
	return Promise.resolve(validation)
}

export function checkMessageParams(ws: WebSocket.WebSocket, schema: AnySchema, params: any, status: number = 999) {
	const validation = schema.validate(params)
	if (validation.error) {
		ws.send(JSON.stringify(new SocketResponseSchema({ message: validation.error.message, status, action: '' })))
		console.log(validation.error.message)
		return Promise.reject(validation)
	}
	return Promise.resolve(validation)
}
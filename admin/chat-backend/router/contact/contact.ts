import Router = require("koa-router")
import { checkParams } from "../../common/utils"
import { ResponseSchema } from "../../response/response"
import { addUserUrl, getContactsUrl } from "../urls"
import { addUserSchema } from "./contact-schema"
import { addUserByUsername, checkContact, getContacts } from "./contact-sql"
import { AddUserBody } from "./contact-types"

const contact = new Router
contact.post(addUserUrl, async ctx => {
	await checkParams(ctx, addUserSchema, ctx.request.body, 1012)
	const body = ctx.request.body as AddUserBody
	const { result } = await checkContact(ctx)
	console.log(result)
	let status = '00', isMaster = true, isInsert = true
	if (result.length) { // 删除或删除并拉黑
		isInsert = false
		status = result[0].status
		isMaster = result[0].master === ctx.session!.username
		console.log(isMaster)
		if (['0', '2'].includes(result[0].status[isMaster ? 0 : 1])) {
			return ctx.body = new ResponseSchema({ message: '请勿重复添加', status: 1013 })
		}
	}
	if (isMaster) { // 目标是sub
		body.status = '0' + status[1]
	} else { // 目标是master
		body.status = status[0] + '0'
	}
	await addUserByUsername(ctx, isInsert, isMaster)
	ctx.body = new ResponseSchema({ message: '添加成功' })
})

contact.get(getContactsUrl, async ctx => {
	const [{result: r1}, {result: r2}] = await getContacts(ctx)
	const noDelFlags = ['0', '2']
	ctx.body = new ResponseSchema({ data: r1.filter(v => noDelFlags.includes(v.status[0])).concat(r2.filter(v => noDelFlags.includes(v.status[1]))) })
})

export default contact
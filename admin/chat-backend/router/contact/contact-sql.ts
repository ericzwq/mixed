import { InsertModal, UpdateModal } from '../../types/sql-types'
import { Context } from 'koa'
import { executeSql } from '../../db'
import { AddUserBody, Contacts } from './contact-types'
import { Users } from '../user/user-types'

// 校验联系人
export function checkContact(ctx: Context) {
	const body = ctx.request.body as AddUserBody
	return executeSql<{
		master: Contacts.Master, status: Contacts.Status
	}[]>(ctx, 'select master,status from contacts where (master = ? and sub = ?) or (master = ? and sub = ?);', [ctx.session!.username, body.username, body.username, ctx.session!.username])
}

interface Contact {
	username: Users.Username, nickname: Users.Nickname, avatar: Users.Avatar, status: Contacts.Status
}
// 获取通讯录
export function getContacts(ctx: Context) {
	const username = ctx.session!.username
	const p1 = executeSql<Contact[]>(ctx, 'select u.username, u.nickname, u.avatar, c.status from contacts c left join users u on c.sub = u.username where c.master = ?;', [username])
	const p2 = executeSql<Contact[]>(ctx, 'select u.username, u.nickname, u.avatar, c.status from contacts c left join users u on c.master = u.username where c.sub = ?;', [username])
	return Promise.all([p1, p2])
}

export function addUserByUsername(ctx: Context, isInsert: boolean, isMaster: boolean) {
	const { username, status } = ctx.request.body as AddUserBody
	let insertData = [ctx.session!.username, username]
	let updateData = insertData.map(v => v)
	if (isInsert) { // 无记录则为主动方
		return executeSql<InsertModal>(ctx, `insert contacts(master, sub, status) values(?, ?, '01');`, insertData)
	} else { // 修改
		if (!isMaster) { // 非原始主动方
			updateData = updateData.reverse()
		}
		return executeSql<UpdateModal>(ctx, 'update contacts set status = ? where master = ? and sub = ?;', [status].concat(updateData))
	}
}
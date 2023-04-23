import { executeSocketSql } from "../db";
import { SessionData } from "../router/user/user-types";
import { InsertModal } from "../types/sql-types";
import {Group, Groups, Message, SocketData} from "./socket-types";

export function addSingleMessage(data: Message) {
	const { from, to, content, type, createdAt } = data
	return executeSocketSql<InsertModal>('insert single_chat(`from`, `to`, content, type, createdAt, status) values(?, ?, ?, ?, ?, 0);', [from, to, content, type, createdAt])
}

export function getChatData(user: SessionData) {
	const { username, leaveTime, loginTime } = user
	console.log(leaveTime)
	return executeSocketSql<SocketData[]>('select `from`,`to`,content `data`,type,status,createdAt from single_chat where createdAt > ? and (`from` = ? or `to` = ?);', [leaveTime || loginTime, username, username])
}

export function addGroupMessage(data: Message) {

}

export function selectGroupById(id: Groups.Id) {
	return executeSocketSql<Group[]>('select * from `groups` where id = ?;', [id])
}
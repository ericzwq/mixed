import {executeSocketSql} from "../../../db";
import {User} from "../../../router/user/user-types";
import {InsertModal} from "../../../types/sql-types";
import {ExtWebSocket, Group, Groups, Message, SocketData} from "../../socket-types";

export function addSingleMessage(ws: ExtWebSocket, data: Message) {
  const {from, to, content, type, createdAt} = data
  return executeSocketSql<InsertModal>(ws, 'insert single_chat(`from`, `to`, content, type, createdAt, status) values(?, ?, ?, ?, ?, 0);', [from, to, content, type, createdAt])
}

export function getChatData(ws: ExtWebSocket, user: User) {
  const {username, leaveTime, loginTime} = user
  console.log(leaveTime)
  return executeSocketSql<SocketData[]>(ws, 'select `from`,`to`,content `data`,type,status,createdAt from single_chat where createdAt > ? and (`from` = ? or `to` = ?);', [leaveTime || loginTime, username, username])
}

export function addGroupMessage(data: Message) {

}
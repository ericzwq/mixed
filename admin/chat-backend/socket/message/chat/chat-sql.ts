import {executeSocketSql} from "../../../db";
import {User} from "../../../router/user/user-types";
import {InsertModal} from "../../../types/sql-types";
import {ExtWebSocket} from "../../socket-types";
import {SgMsgReq, SgMessages, SgMsgRes} from "./chat-types";

export function selectSgMsgByFakeId(ws: ExtWebSocket, fakeId: SgMessages.FakeId) {
  return executeSocketSql<[]>(ws,
    `select id
     from single_chat
     where fakeId = ?;`, [fakeId])
}

export function selectSgMsgById(ws: ExtWebSocket, id: SgMessages.Id | null) {
  return executeSocketSql<SgMsgRes[]>(ws,
    `select *
     from single_chat
     where id = ?;`, [id])
}

export function updateSgMsgNext(ws: ExtWebSocket, next: SgMessages.Next, id: SgMessages.Id) {
  return executeSocketSql(ws,
    `update single_chat
     set next = ?
     where id = ?;`, [next, id])
}

export function addSgMsg(ws: ExtWebSocket, data: SgMsgReq) {
  const {fakeId, from, to, content, type, createdAt} = data
  return executeSocketSql<InsertModal>(ws,
    'insert single_chat(fakeId, `from`, `to`, content, type, createdAt, status) values(?, ?, ?, ?, ?, ?, 0);', [fakeId, from, to, content, type, createdAt])
}

export function getChatData(ws: ExtWebSocket, user: User) {
  const {username, leaveTime, loginTime} = user
  return executeSocketSql<SgMsgRes[]>(ws, 'select `from`,`to`,content `data`,type,status,createdAt from single_chat where createdAt > ? and (`from` = ? or `to` = ?);', [leaveTime || loginTime, username, username])
}

export function addGroupMessage(data: SgMsgReq) {

}
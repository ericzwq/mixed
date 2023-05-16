import {executeSocketSql} from '../../../db'
import {User, Users} from '../../../router/user/user-types'
import {InsertModal, UpdateModal} from '../../../types/sql-types'
import {ExtWebSocket, MsgRead, MsgStatus} from '../../socket-types'
import {SgMsgReq, SgMsgs, SgMsgRes, GetHisSgMsgReq} from './single-types'
import {Contacts} from "../contact/contact-types";
import {FriendApls} from "../user/user-types";
import Status = FriendApls.Status;
import {GpMsgReq} from "../group/group-types";

export async function selectFriendAplByAddUser(ws: ExtWebSocket, to: Users.Username, from: Users.Username) {
  const {result} = await executeSocketSql<{ id: Contacts.Id }[]>(ws,
    'select id from contacts where master = ? and sub = ?;', [from, to])
  if (!result.length) return {result: []}
  return executeSocketSql<{ id: FriendApls.Id, status: FriendApls.Status }[]>(ws, 'select id, status from friend_applications where contactId = ?;', [result[0].id])
}

export function addFriendApl(ws: ExtWebSocket, contactId: Contacts.Id, reason: FriendApls.Reason) {
  return executeSocketSql<InsertModal>(ws,
    'insert into friend_applications(contactId, reason, status) values (?, ?, 0);', [contactId, reason])
}

export function selectFriendAplsById(ws: ExtWebSocket, username: Users.Username, preId: Users.LastFriendAplId, lastFriendAplId: Users.LastFriendAplId) {
  const join = preId == null ? '=' : '>=' // 传空则只取一条
  return executeSocketSql<[]>(ws,
    `select f.id friendAplId, contactId, c.master "from", c.sub "to", f.status, f.createdAt
     from friend_applications f
              left join contacts c on f.contactId = c.id
     where f.id ${join} ? and (c.master = ? or c.sub = ?);`, [preId || lastFriendAplId, username, username])
}

export function updateLastFriendAplId(ws: ExtWebSocket, usernames: Users.Username[], id: Users.LastFriendAplId) {
  return executeSocketSql<UpdateModal>(ws, 'update users set last_friend_apl_id = ? where username in (?);', [id, usernames])
}

export function resetFriendAplById(ws: ExtWebSocket, id: FriendApls.Id, reason: FriendApls.Reason) {
  return executeSocketSql<UpdateModal>(ws, 'update friend_applications set status = ?, reason = ? where id = ?;', [Status.pending, reason, id])
}

export function updateFriendAplStatus(ws: ExtWebSocket, id: FriendApls.Id, contactId: Contacts.Id, master: Users.Username, sub: Users.Username, status: FriendApls.Status, updatedAt: string) {
  return executeSocketSql<InsertModal>(
    ws, `update friend_applications f left join contacts c on f.contactId = c.id
         set f.status    = ?,
             f.updatedAt = ?
         where f.id = ?
           and f.contactId = ?
           and f.status = ?
           and c.master = ?
           and c.sub = ?;`, // 顺便校验master、sub、status的正确性
    [status, updatedAt, id, contactId, Status.pending, master, sub])
}

export function selectSgMsgByFakeId(ws: ExtWebSocket, fakeId: SgMsgs.FakeId) {
  return executeSocketSql<[]>(ws,
    `select id
     from single_chat
     where fakeId = ?;`, [fakeId])
}

export function selectNewSgMsgs(ws: ExtWebSocket, id: SgMsgs.Id | null) {
  return executeSocketSql<[[{ messages: string }]]>(ws, `call selectNewSgMsgs(?, 20);`, [id])
}

// 根据lastId获取当前客户端最后一条消息
export function selectLastSgMsg(ws: ExtWebSocket, lastId: SgMsgs.Id | null, from: SgMsgs.From, to: SgMsgs.To) {
  if (lastId != null) {
    return executeSocketSql<SgMsgRes[]>(ws,
      'select * from single_chat where id = ?;', [lastId])
  } else {
    return executeSocketSql<SgMsgRes[]>(ws,
      'select * from single_chat where next is null and ((`from` = ? and `to` = ?) or (`from` = ? and `to` = ?));', [from, to, to, from])
  }
}

export function selectHisSgMsgs(ws: ExtWebSocket, data: GetHisSgMsgReq) {
  const {maxId, count, minId} = data
  return executeSocketSql<[[{ messages: string }]]>(ws, `call selectHisSgMsgs(?, ?, ?);`, [maxId, count, minId])
}

export function updateSgMsgNext(ws: ExtWebSocket, next: SgMsgs.Next, id: SgMsgs.Id) {
  return executeSocketSql(ws,
    'update single_chat set next = ? where id = ?;', [next, id])
}

export function addSgMsg(ws: ExtWebSocket, from: Users.Username, data: SgMsgReq, createdAt: SgMsgs.CreatedAt) {
  const {fakeId, to, content, type, pre} = data
  return executeSocketSql<InsertModal>(ws,
    'insert into single_chat(fakeId, pre, `from`, `to`, content, type, createdAt, status) values(?, ?, ?, ?, ?, ?, ?, ?);',
    [fakeId, pre, from, to, content, type, createdAt, MsgStatus.normal])
}

export function selectSgMsgByIdAndFrom(ws: ExtWebSocket, id: SgMsgs.Id, from: SgMsgs.From) {
  return executeSocketSql<{ createdAt: SgMsgs.CreatedAt, status: MsgStatus }[]>(ws,
    'select \`to\`, createdAt, status from single_chat where id = ? and \`from\` = ?;', [id, from])
}

export function updateSgMsgStatus(ws: ExtWebSocket, id: SgMsgs.Id, status: MsgStatus) {
  return executeSocketSql<UpdateModal>(ws, 'update single_chat set status = ? where id = ?', [status, id])
}

export function updateSgMsgsRead(ws: ExtWebSocket, ids: SgMsgs.Id[], from: SgMsgs.From, to: SgMsgs.To) {
  return executeSocketSql<UpdateModal>(ws, 'update single_chat set `read` = ? where id in (?) and `from` = ? and `to` = ?;', [MsgRead.yes, ids, to, from])
}

export function getChatData(ws: ExtWebSocket, user: User) {
  const {username, leaveTime, loginTime} = user
  return executeSocketSql<SgMsgRes[]>(ws, 'select `from`,`to`,content `data`,type,status,createdAt from single_chat where createdAt > ? and (`from` = ? or `to` = ?);',
    [leaveTime || loginTime, username, username])
}

export function addGroupMessage(data: GpMsgReq) {

}

import {Users} from '../../../router/user/user-types'
import {executeSocketSql} from '../../../db'
import {Contacts} from '../contact/contact-types'
import {InsertModal, UpdateModal} from '../../../types/sql-types'
import {FriendApls} from './user-types'
import Status = FriendApls.Status
import {ExtWebSocket} from '../../socket-types'

export function getUserByUsername(ws: ExtWebSocket, username: Users.Username) {
  return executeSocketSql<{
    username: Users.Username, nickname: Users.Nickname, avatar: Users.Avatar
  }[]>(ws, 'select username, nickname, avatar from users where username = ? limit 1;', [username])
}

export function addContactByMasterAndSub(ws: ExtWebSocket, sub: Users.Username, master: Users.Username, status: Contacts.Status, remark: Contacts.Remark) {
  return executeSocketSql<InsertModal>(ws, `insert contacts(master, sub, status, remark) values(?, ?, ?, ?);`, [master, sub, status, remark])
}

export function updateContactStatus(ws: ExtWebSocket, id: Contacts.Id, sub: Users.Username, master: Users.Username, status: Contacts.Status) {
  return executeSocketSql<UpdateModal>(ws, 'update contacts set status = ? where id = ? and master = ? and sub = ?;', [status, id, master, sub])
}

export function selectContactByAddUser(ws: ExtWebSocket, to: Users.Username, from: Users.Username) {
  return executeSocketSql<{ id: Contacts.Id, status: Contacts.Status }[]>(ws, 'select id, status from contacts where (master = ? and sub = ?);', [from, to])
}

export function resetContactById(ws: ExtWebSocket, id: Contacts.Id, remark: Contacts.Remark) {
  return executeSocketSql<UpdateModal>(ws, 'update contacts set remark = ?, status = ? where id = ?;', [remark, Contacts.Status.delete, id])
}

export async function selectFriendAplByAddUser(ws: ExtWebSocket, to: Users.Username, from: Users.Username) {
  const {result} = await executeSocketSql<{ id: Contacts.Id }[]>(ws,
    `select id
     from contacts
     where master = ?
       and sub = ?;`, [from, to])
  if (!result.length) return {result: []}
  return executeSocketSql<{ id: FriendApls.Id, status: FriendApls.Status }[]>(ws, 'select id, status from friend_applications where contactId = ?;', [result[0].id])
}

export function addFriendApl(ws: ExtWebSocket, contactId: Contacts.Id, reason: FriendApls.Reason) {
  return executeSocketSql<InsertModal>(ws,
    `insert friend_applications(contactId, reason, status) values(?, ?, 0);`, [contactId, reason])
}

export function selectFriendAplsById(ws: ExtWebSocket, username: Users.Username, id: Users.LastFriendAplId, lastFriendAplId: Users.LastFriendAplId) {
  const join = id === null ? '=' : '>=' // 传空则只取一条
  return executeSocketSql<[]>(ws,
    `select f.id friendAplId, contactId, c.master "from", c.sub "to", f.status, f.createdAt
     from friend_applications f
              left join contacts c on f.contactId = c.id
     where f.id ${join} ? and (c.master = ? or c.sub = ?);`, [id || lastFriendAplId, username, username])
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

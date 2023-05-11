import {executeSocketSql} from '../../../db'
import {User} from '../../../router/user/user-types'
import {InsertModal} from '../../../types/sql-types'
import {ExtWebSocket} from '../../socket-types'
import {SgMsgReq, SgMsgs, SgMsgRes, GetHisSgMsgReq} from './chat-types'

export function selectSgMsgByFakeId(ws: ExtWebSocket, fakeId: SgMsgs.FakeId) {
  return executeSocketSql<[]>(ws,
    `select id
     from single_chat
     where fakeId = ?;`, [fakeId])
}

export function selectNewSgMsgsById(ws: ExtWebSocket, id: SgMsgs.Id | null) {
  return executeSocketSql<[[{ messages: string }]]>(ws, `call selectNewSgMsgs(?, 20);`, [id])
}

// 根据preId获取当前客户端最后一条消息
export function selectLastSgMsg(ws: ExtWebSocket, preId: SgMsgs.Id | null, from: SgMsgs.From, to: SgMsgs.To) {
  if (preId != null) {
    return executeSocketSql<SgMsgRes[]>(ws,
      `select *
       from single_chat
       where id = ?;`, [preId])
  } else {
    return executeSocketSql<SgMsgRes[]>(ws,
      `select *
       from single_chat
       where \`from\` = ?
         and \`to\` = ?
         and next is null;`, [from, to])
  }
}

export function selectHisSgMsgs(ws: ExtWebSocket, data: GetHisSgMsgReq) {
  const {maxId, maxCount, minId} = data
  return executeSocketSql(ws, `call selectHisSgMsgs(?, ?, ?);`, [maxId, maxCount, minId])
}

export function updateSgMsgNext(ws: ExtWebSocket, next: SgMsgs.Next, id: SgMsgs.Id) {
  return executeSocketSql(ws,
    `update single_chat
     set next = ?
     where id = ?;`, [next, id])
}

export function addSgMsg(ws: ExtWebSocket, data: SgMsgReq) {
  const {fakeId, from, to, content, type, createdAt, pre} = data
  return executeSocketSql<InsertModal>(ws,
    'insert single_chat(fakeId, pre, `from`, `to`, content, type, createdAt, status) values(?, ?, ?, ?, ?, ?, ?, 0);', [fakeId, pre, from, to, content, type, createdAt])
}

export function getChatData(ws: ExtWebSocket, user: User) {
  const {username, leaveTime, loginTime} = user
  return executeSocketSql<SgMsgRes[]>(ws, 'select `from`,`to`,content `data`,type,status,createdAt from single_chat where createdAt > ? and (`from` = ? or `to` = ?);', [leaveTime || loginTime, username, username])
}

export function addGroupMessage(data: SgMsgReq) {

}

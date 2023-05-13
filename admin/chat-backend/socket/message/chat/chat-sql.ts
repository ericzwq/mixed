import {executeSocketSql} from '../../../db'
import {User} from '../../../router/user/user-types'
import {InsertModal, UpdateModal} from '../../../types/sql-types'
import {ExtWebSocket, MsgRead, MsgStatus} from '../../socket-types'
import {SgMsgReq, SgMsgs, SgMsgRes, GetHisSgMsgReq} from './chat-types'

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
      `select *
       from single_chat
       where id = ?;`, [lastId])
  } else {
    return executeSocketSql<SgMsgRes[]>(ws,
      `select *
       from single_chat
       where next is null
         and ((\`from\` = ?
           and \`to\` = ?)
           or (\`from\` = ?
               and \`to\` = ?));`, [from, to, to, from])
  }
}

export function selectHisSgMsgs(ws: ExtWebSocket, data: GetHisSgMsgReq) {
  const {maxId, count, minId} = data
  return executeSocketSql<[[{ messages: string }]]>(ws, `call selectHisSgMsgs(?, ?, ?);`, [maxId, count, minId])
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

export function selectSgMsgByIdAndFrom(ws: ExtWebSocket, id: SgMsgs.Id, from: SgMsgs.From) {
  return executeSocketSql<{ createdAt: SgMsgs.CreatedAt, status: MsgStatus }[]>(ws, `select \`to\`, createdAt, status
                                                                                         from single_chat
                                                                                         where id = ?
                                                                                           and \`from\` = ?;`, [id, from])
}

export function updateSgMsgStatus(ws: ExtWebSocket, id: SgMsgs.Id, status: MsgStatus) {
  return executeSocketSql<UpdateModal>(ws, `update single_chat
                                            set status = ?
                                            where id = ?`, [status, id])
}

export function updateSgMsgsRead(ws: ExtWebSocket, ids: SgMsgs.Id[], from: SgMsgs.From, to: SgMsgs.To) {
  return executeSocketSql<UpdateModal>(ws, `update single_chat
                                            set \`read\` = ?
                                            where id in (?)
                                              and \`from\` = ?
                                              and \`to\` = ?;`, [MsgRead.yes, ids, to, from])
}

export function getChatData(ws: ExtWebSocket, user: User) {
  const {username, leaveTime, loginTime} = user
  return executeSocketSql<SgMsgRes[]>(ws, 'select `from`,`to`,content `data`,type,status,createdAt from single_chat where createdAt > ? and (`from` = ? or `to` = ?);', [leaveTime || loginTime, username, username])
}

export function addGroupMessage(data: SgMsgReq) {

}

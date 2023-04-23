import {SocketResponseSchema} from "../../../response/response";
import * as WebSocket from "ws";
import {SessionData} from "../../../router/user/user-types";
import {checkMessageParams} from "../../../common/utils";
import {addUserSchema} from "./contact-schema";
import {AddUserMessage} from "./contact-types";
import {addUserByUsername, checkContact, getContactsByUsername} from "./contact-sql";
import {ADD_USER} from "../../socket-actions";

export async function getContacts(ws: WebSocket.WebSocket, session: SessionData) {
  const [{result: r1}, {result: r2}] = await getContactsByUsername(session)
  const noDelFlags = ['0', '2']
  ws.send(JSON.stringify(new SocketResponseSchema({data: r1.filter(v => noDelFlags.includes(v.status[0])).concat(r2.filter(v => noDelFlags.includes(v.status[1])))})))
}

export async function addUser(ws: WebSocket.WebSocket, session: SessionData, data: AddUserMessage) {
  const body = data.data
  await checkMessageParams(ws, addUserSchema, body, 1012)
  const {result} = await checkContact(body, session)
  console.log(result)
  let status = '00', isMaster = true, isInsert = true
  if (result.length) { // 删除或删除并拉黑
    isInsert = false
    status = result[0].status
    isMaster = result[0].master === session!.username
    console.log(isMaster)
    if (['0', '2'].includes(result[0].status[isMaster ? 0 : 1])) {
      return ws.send(JSON.stringify(new SocketResponseSchema({message: '请勿重复添加', status: 1013})))
    }
  }
  if (isMaster) { // 目标是sub
    body.status = '0' + status[1]
  } else { // 目标是master
    body.status = status[0] + '0'
  }
  await addUserByUsername(body, session, isInsert, isMaster)
  // ws.send(JSON.stringify(new SocketResponseSchema({message: '添加成功'})))
  ws.send(JSON.stringify(new SocketResponseSchema({action: ADD_USER, data: {from: session.username, to: body.username}})))
}
import {checkMessageParams} from "../../../common/utils";
import {SessionData, Users} from "../../../router/user/user-types";
import {ExtWebSocket, Group, Groups, RequestMessage} from "../../socket-types";
import {addGroupRetSchema, addGroupSchema} from "./group-schema";
import {resetGroupApl, selectGroupAplByAddGroup, selectGroupById} from "./group-sql";
import {AddGroupBody, AddGroupRetBody} from "./group-types";
import client from "../../../redis/redis";
import {usernameClientMap} from "../chat/chat";
import {addFriendApl} from "../user/user-sql";

export async function createGroup() {

}

export async function getGroupById(ws: ExtWebSocket, id: Groups.Id): Promise<Group> {
  const _group = await client.get('group-' + id)
  if (_group) return JSON.parse(_group)
  const {result} = await selectGroupById(id)
  if (!result.length) {
    ws.json({status: 1004, message: '未知的群聊id：' + id})
    return Promise.reject()
  }
  const group = result[0]
  group.managers = group.managers ? new Set(group.manager!.split(',')) : new Set()
  group.members = group.members ? new Set(group.member!.split(',')) : new Set()
  delete group.manager
  delete group.member
  await client.set('group-' + id, JSON.stringify(group))
  return group
}

export function isUserInGroup(username: Users.Username, group: Group) {
  return username === group.leader || group.managers.has(username) || group.members.has(username)
}

export async function addGroup(ws: ExtWebSocket, session: SessionData, data: RequestMessage<AddGroupBody>) {
  await checkMessageParams(ws, addGroupSchema, data.data, 1001)
  const {id: to, reason} = data.data
  const group = await getGroupById(ws, to)
  if (isUserInGroup(session.username, group)) return ws.json({message: '你已在群里', status: 1002})
  const {username: from, nickname, avatar} = session
  const {result} = await selectGroupAplByAddGroup(to, from)
  if (result.length) {
    const status = result[0].status
    if (status === 0) return ws.json({message: '请勿重复申请', status: 1003})
    if (status === 1) return ws.json({message: '目标用户已是您的好友', status: 1004})
    await resetGroupApl(to, from, reason)
  } else {
    await addFriendApl(to, from, reason)
  }
  ws.json({message: '申请成功', action: data.action, data: {from}})
  const res = JSON.stringify({action: data.action, data: {from, nickname, avatar}})
  usernameClientMap[group.leader]?.send(res)
  group.managers.forEach(manager => usernameClientMap[manager]?.send(res))
}

export async function addGroupRet(ws: ExtWebSocket, session: SessionData, data: RequestMessage<AddGroupRetBody>) {
  await checkMessageParams(ws, addGroupRetSchema, 1005)
  const body = data.data
  const {to, status} = body
  const from = session.username

}
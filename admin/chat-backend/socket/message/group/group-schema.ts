import * as Joi from "joi";
import {userSchemas} from "../../../router/user/user-schema";
import {GroupApls} from "./group-types";
import Status = GroupApls.Status;

export const groupSchemas = {
  id: Joi.number().required(),
  friendAplId: Joi.number().required(),
  reason: Joi.string().max(50).required(),
  name: Joi.string().max(20).required(),
  avatar: Joi.string().max(100).allow('')
}

const gpMsgSchemas = {
  id: Joi.number(),
  content: Joi.required(),
  fakeId: Joi.string().required(), // 前端消息id
  type: Joi.valid(1, 2, 3, 4, 5, 6, 7),
  ext: Joi.string().allow(null, ''),
}

export const sendGpMsgSchema = Joi.object({
  to: groupSchemas.id,
  content: gpMsgSchemas.content,
  fakeId: gpMsgSchemas.fakeId,
  type: gpMsgSchemas.type,
  ext: gpMsgSchemas.ext,
  lastId: gpMsgSchemas.id.allow(null)
}).unknown().required()

export const transmitGpMsgsSchema = Joi.object({
  to: groupSchemas.id,
  lastId: gpMsgSchemas.id.allow(null),
  msgs: Joi.array()
}).unknown().required()

export const createGroupSchema = Joi.object({
  members: Joi.array().max(100),
  name: groupSchemas.name,
  avatar: groupSchemas.avatar
}).unknown().required()

export const groupInviteSchema = Joi.object({
  members: Joi.array().max(20),
  to: groupSchemas.id
})

export const addGroupSchema = Joi.object({
  id: groupSchemas.friendAplId,
  reason: groupSchemas.reason
}).unknown().required()

export const addGroupRetSchema = Joi.object({
  to: userSchemas.username,
  status: Joi.valid(Status.accept, Status.reject).required()
}).unknown().required()

export const groupInviteRetSchema = Joi.object({
  id: groupSchemas.id,
  status: Joi.valid(Status.accept, Status.reject).required(),
}).unknown().required()

export const getGroupAplsSchema = Joi.object({
  lastGroupAplId: userSchemas.lastGroupAplId
}).unknown().required()

export const readGpMsgsSchema = Joi.object({
  ids: Joi.array().required().min(1).max(100),
  to: groupSchemas.id
}).unknown().required()

export const getHisGpMsgsSchema = Joi.object({
  maxId: gpMsgSchemas.id.required(),
  count: Joi.number().allow(null),
  minId: gpMsgSchemas.id.allow(null)
}).unknown().required()

export const getGroupInfoSchema = Joi.object({
  id: groupSchemas.id
}).unknown().required()

export const getGroupMembersSchema = Joi.object({
  id: groupSchemas.id
}).unknown().required()

export const getGpMsgByIdsSchema = Joi.array().required()

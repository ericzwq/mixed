import * as Joi from "joi";
import {userSchemas} from "../../../router/user/user-schema";
import {GroupApls} from "./group-types";
import Status = GroupApls.Status;

const groupSchemas = {
  id: Joi.number().required(),
  friendAplId: Joi.number().required(),
  reason: Joi.string().max(50).required(),
  name: Joi.string().max(20),
  avatar: Joi.string().max(20)
}

const gpMsgSchemas = {
  id: Joi.number().required(),
  content: Joi.required(),
  fakeId: Joi.string().required(), // 前端消息id
  type: Joi.valid(1, 2, 3, 4, 5, 6),
  ext: Joi.string().allow(null, ''),
}

export const createGroupSchema = Joi.object({
  members: Joi.array().max(10),
  name: groupSchemas.name,
}).unknown().required()

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
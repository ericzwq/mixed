import * as Joi from "joi";
import {userSchemas} from "../../../router/user/user-schema";
import {GroupApls} from "./group-types";
import Status = GroupApls.Status;
import Type = GroupApls.Type;

export const groupSchemas = {
  id: Joi.number().required(),
  friendAplId: Joi.number().required(),
  reason: Joi.string().max(50).required(),
  name: Joi.string().max(20),
  avatar: Joi.string().max(20)
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
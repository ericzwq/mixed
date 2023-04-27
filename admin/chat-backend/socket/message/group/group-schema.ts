import * as Joi from "joi";
import {userSchemas} from "../../../router/user/user-schema";
import {GroupApls} from "./group-types";
import Status = GroupApls.Status;

export const groupSchemas = {
  friendAplId: Joi.number().required(),
  reason: Joi.string().max(50).required()
}

export const addGroupSchema = Joi.object({
  id: groupSchemas.friendAplId,
  reason: groupSchemas.reason
})

export const addGroupRetSchema = Joi.object({
  to: userSchemas.username,
  status: Joi.valid(Status.accept, Status.reject).required()
})
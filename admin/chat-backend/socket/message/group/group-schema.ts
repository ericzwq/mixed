import * as Joi from "joi";
import {userSchemas} from "../../../router/user/user-schema";

export const groupSchemas = {
  id: Joi.number().required(),
  reason: Joi.string().max(50).required()
}

export const addGroupSchema = Joi.object({
  id: groupSchemas.id,
  reason: groupSchemas.reason
})

export const addGroupRetSchema = Joi.object({
  to: userSchemas.username,
  status: Joi.number().allow(1, 2)
})
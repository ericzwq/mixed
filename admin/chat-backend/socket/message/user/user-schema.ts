import * as Joi from 'joi'
import {userSchemas} from '../../../router/user/user-schema'
import {friendApplicationSchemas} from "../message-schemas";

export const searchUserSchema = Joi.object({
  username: userSchemas.username
}).required()

export const addUserSchema = Joi.object({
  username: userSchemas.username,
  reason: friendApplicationSchemas.reason
}).required()

export const addUserRetSchema = Joi.object({
  to: userSchemas.username,
  status: Joi.number().allow(1, 2)
}).required()

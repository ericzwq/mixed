import * as Joi from 'joi'
import {userSchemas} from '../../../router/user/user-schema'

export const searchUserSchema = Joi.object({
  username: userSchemas.username
}).required()

export const addUserSchema = searchUserSchema

export const addUserRetSchema = Joi.object({
  to: userSchemas.username,
  status: Joi.number().allow(1, 2)
}).required()

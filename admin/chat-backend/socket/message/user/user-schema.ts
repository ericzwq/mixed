import * as Joi from 'joi'
import {userSchemas} from '../../../router/user/user-schema'
import {friendAplSchemas} from '../message-schemas'
import {contactSchemas} from '../contact/contact-schema'
import {FriendApls} from './user-types'
import Status = FriendApls.Status
import {indexSchema, sizeSchema} from "../common/common-schems";

export const searchUserSchema = Joi.object({
  usernames: Joi.array().required()
}).unknown().required()

export const getFriendAplsSchema = Joi.object({
  index: indexSchema,
  size: sizeSchema,
}).unknown()

export const addUserSchema = Joi.object({
  username: userSchemas.username,
  reason: friendAplSchemas.reason,
  remark: friendAplSchemas.remark.required()
}).unknown().required()

export const addUserRetSchema = Joi.object({
  friendAplId: friendAplSchemas.id,
  contactId: contactSchemas.id,
  to: userSchemas.username,
  status: Joi.valid(Status.accept, Status.reject).required(),
  remark: friendAplSchemas.remark.when('status', {is: Status.accept, then: Joi.required()})
}).unknown().required()
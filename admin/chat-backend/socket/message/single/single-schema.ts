import * as Joi from 'joi'
import {userSchemas} from '../../../router/user/user-schema'
import {chatTypeSchema} from "../message-schemas";
import {SgMsgs} from "./single-types";

export const sgMsgSchemas = {
  id: Joi.number(),
  content: Joi.required(),
  fakeId: Joi.string().required(), // 前端消息id
  type: Joi.valid(1, 2, 3, 4, 5, 6, 7),
  ext: Joi.string().allow(null, ''),
  status: Joi.valid(0, 1, 2).required()
}

export const sendSgMsgSchema = Joi.object({
  to: userSchemas.username,
  content: sgMsgSchemas.content,
  fakeId: sgMsgSchemas.fakeId,
  type: sgMsgSchemas.type,
  ext: sgMsgSchemas.ext,
  lastId: sgMsgSchemas.id.allow(null),
  status: sgMsgSchemas.status
}).unknown().required()

export const transmitSgMsgsSchema = Joi.object({
  to: userSchemas.username,
  lastId: sgMsgSchemas.id.allow(null),
  msgs: Joi.array()
}).unknown().required()

export const getHisSgMsgsSchema = Joi.object({
  maxId: sgMsgSchemas.id.required(),
  count: Joi.number().allow(null),
  minId: sgMsgSchemas.id.allow(null)
}).unknown().required()

export const readSgMsgSchema = Joi.object({
  ids: Joi.array().required().min(1).max(100),
  to: userSchemas.username
}).unknown().required()

export const getSgMsgByIdsSchema = Joi.object({
  fakeId: Joi.string().required(),
  data: Joi.array().required()
}).unknown().required()

export const replySgContSchema = Joi.object({
  id: sgMsgSchemas.id,
  data: sgMsgSchemas.content
}).unknown().required()
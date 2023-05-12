import * as Joi from 'joi'

const sgMsgSchemas = {
  id: Joi.number(),
  target: Joi.string().required(),
  content: Joi.required(),
  fakeId: Joi.string().required(), // 前端消息id
  type: Joi.valid(1, 2, 3, 4, 5),
  action: Joi.string().required(),
  ext: Joi.string().allow(null, ''),
}

export const sgMsgSchema = Joi.object({
  target: sgMsgSchemas.target,
  content: sgMsgSchemas.content,
  fakeId: sgMsgSchemas.fakeId,
  type: sgMsgSchemas.type,
  ext: sgMsgSchemas.ext,
  lastId: sgMsgSchemas.id.allow(null)
}).unknown().required()

export const getHisSgMsgsSchema = Joi.object({
  maxId: sgMsgSchemas.id.required(),
  count: Joi.number().allow(null),
  minId: sgMsgSchemas.id.allow(null)
}).unknown().required()
import * as Joi from 'joi'

const sgMsgSchemas = {
  id: Joi.number(),
  target: Joi.string().required(),
  content: Joi.required(),
  fakeId: Joi.string().required(), // 前端消息id
  type: Joi.number().required(),
  action: Joi.string().required(),
  ext: Joi.string().allow(null, ''),
  preId: Joi.number().allow(null)
}

export const sgMsgSchema = Joi.object({
  target: sgMsgSchemas.target,
  content: sgMsgSchemas.content,
  fakeId: sgMsgSchemas.fakeId,
  type: sgMsgSchemas.type,
  ext: sgMsgSchemas.ext,
  preId: sgMsgSchemas.preId
}).unknown().required()

export const getHisSgMsgsSchema = Joi.object({
  maxId: sgMsgSchemas.id.required(),
  maxCount: Joi.number().allow(null),
  minId: sgMsgSchemas.id.allow(null)
}).unknown().required()

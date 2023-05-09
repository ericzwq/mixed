import * as Joi from "joi";

const sgMsgSchemas = {
  target: Joi.string().required(),
  content: Joi.required(),
  fakeId: Joi.string().required(), // 前端消息id
  type: Joi.number().required(),
  action: Joi.string().required(),
  ext: Joi.string().allow(null, ''),
  preId: Joi.number().required()
}

export const sgMsgSchema = Joi.object({
  target: sgMsgSchemas.target,
  content: sgMsgSchemas.content,
  fakeId: sgMsgSchemas.fakeId,
  type: sgMsgSchemas.type,
  action: sgMsgSchemas.action,
  ext: sgMsgSchemas.ext,
  preId: sgMsgSchemas.preId
})
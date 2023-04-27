import * as Joi from 'joi'

export const friendAplSchemas = {
  reason: Joi.string().required().max(50),
  remark: Joi.string().max(20),
  id: Joi.number().required()
}

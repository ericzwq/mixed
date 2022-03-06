import Joi = require('joi')

export const registerSchema = Joi.object({
  username: Joi.string().max(18).min(2).required(),
  password: Joi.string().max(18).min(2).required(),
  email: Joi.string().email().required()
})

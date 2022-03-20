import Joi = require('joi')

const schemas = {
  username: Joi.string().max(18).min(2).required(),
  password: Joi.string().max(18).min(2).required(),
  email: Joi.string().email().required(),
  code: Joi.required()
}
export const registerSchema = Joi.object({
  username: schemas.username,
  password: schemas.password,
  email: schemas.email,
  code: schemas.code,
}).unknown() // 允许出现其他字段

export const getEmailCodeSchema = Joi.object({
  email: schemas.email
}).unknown()

export const loginSchema = Joi.object({
  username: schemas.username,
  password: schemas.password
}).unknown()

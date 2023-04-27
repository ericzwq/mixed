import Joi = require('joi')

export const userSchemas = {
	friendAplId: Joi.number().required(),
	username: Joi.string().max(18).min(2).required(),
	password: Joi.string().max(18).min(2).required(),
	nickname: Joi.string().max(18).min(2).required(),
	avatar: Joi.string().required(),
	email: Joi.string().email().required(),
	code: Joi.required()
}
export const registerSchema = Joi.object({
	username: userSchemas.username,
	password: userSchemas.password,
	nickname: userSchemas.nickname,
	avatar: userSchemas.avatar,
	email: userSchemas.email,
	code: userSchemas.code,
}).required().unknown() // 允许出现其他字段

export const getEmailCodeSchema = Joi.object({
	email: userSchemas.email
}).required().unknown()

export const loginSchema = Joi.object({
	username: userSchemas.username,
	password: userSchemas.password
}).required().unknown()

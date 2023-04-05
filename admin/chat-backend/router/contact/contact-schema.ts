import Joi = require("joi");
import { userSchemas } from "../user/user-schema";

const contactSchemas = {
	master: userSchemas.username,
	sub: userSchemas.username,
	status: Joi.string().length(2).required()
}

export const addUserSchema = Joi.object({
	username: contactSchemas.sub
})
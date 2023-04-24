import * as Joi from "joi";

export const friendApplicationSchemas = {
  reason: Joi.string().required().max(50)
}
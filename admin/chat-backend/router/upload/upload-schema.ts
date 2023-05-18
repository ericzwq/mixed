import * as Joi from "joi";

export const upFileSchema = Joi.object({
  file: Joi.object().required()
}).unknown().required()
import * as Joi from "joi";

export const upAvatarSchema = Joi.object({
  file: Joi.object().required()
}).unknown().required()
import Joi = require('joi')

export const createPostSchema = Joi.object({
  content: Joi.string().trim(),
  contentType: Joi.string(),
  images: Joi.array(),
  videos: Joi.array(),
})

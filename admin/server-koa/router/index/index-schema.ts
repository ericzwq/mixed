import Joi = require('joi')

export const selectPostsSchema = Joi.object({
  pageIndex: Joi.number(),
  pageSize: Joi.number()
}).unknown()

export const likePostSchema = Joi.object({
  postId: Joi.number().required()
}).unknown()

export const commentPostSchema = Joi.object({
  postId: Joi.number().required(),
  parentId: Joi.number(),
  content: Joi.string().trim().required()
}).unknown()

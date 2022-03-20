import Joi = require('joi')

export const selectPostsSchema = Joi.object({
  pageIndex: Joi.number(),
  pageSize: Joi.number()
}).unknown()

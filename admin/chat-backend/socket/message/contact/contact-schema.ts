import Joi = require('joi')
import {userSchemas} from '../../../router/user/user-schema'

export const contactSchemas = {
  master: userSchemas.username,
  sub: userSchemas.username,
  status: Joi.string().length(2).required()
}

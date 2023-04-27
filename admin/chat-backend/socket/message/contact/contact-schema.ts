import Joi = require('joi')
import {userSchemas} from '../../../router/user/user-schema'

export const contactSchemas = {
  id: Joi.number().required(),
  master: userSchemas.username,
  sub: userSchemas.username,
  status: Joi.number().required()
}

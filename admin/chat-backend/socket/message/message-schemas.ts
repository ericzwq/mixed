import * as Joi from 'joi'
import {ChatType} from "./common/common-types";

export const friendAplSchemas = {
  reason: Joi.string().required().max(50),
  remark: Joi.string().max(20),
  id: Joi.number().required()
}

export const chatTypeSchema = Joi.valid(ChatType.single, ChatType.group).required()
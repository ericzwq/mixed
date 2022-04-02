import {Context} from 'koa'
import {AnySchema} from 'joi'
import {ResponseSchema} from '../response/response'

export const setExcelType = function (res: any) {
  // res.setHeader('Content-Type', 'application/vnd.ms-excel') // application/vnd.openxmlformats
  // res.setHeader('Content-Type', 'application/vnd.openxmlformats;charset=utf-8')
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8')
  res.setHeader('Content-Disposition', 'attachment; filename=scores.xlsx')
}

export function formatDate(date = new Date()) {
  let y = date.getFullYear()
  let m = date.getMonth() + 1 + ''
  let d = date.getDate() + ''
  let h = date.getHours() + ''
  let mi = date.getMinutes() + ''
  let s = date.getSeconds() + ''
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')} ${h.padStart(2, '0')}:${mi.padStart(2, '0')}:${s.padStart(2, '0')}`
}

export function checkParams(ctx: Context, schema: AnySchema, params: any, status: number = 888) {
  const validation = schema.validate(params)
  if (validation.error) {
    ctx.body = new ResponseSchema({message: validation.error.message, status})
    console.log(validation.error.message)
    return Promise.reject(validation)
  }
  return Promise.resolve(validation)
}

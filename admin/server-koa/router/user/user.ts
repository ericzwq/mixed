import {getEmailCodeSchema, loginSchema, registerSchema} from './user-schema'
import Router = require('koa-router')
import {addUser, getEmailByUsernameOrEmail, getUserByLogin} from './user-sql'
import {GetEmailCodeQuery, LoginReqBody, RegisterBody, SessionData} from './user-types'
import client from '../../redis/redis'
import {checkParams, formatDate} from '../../common/utils'
import {getEmailCodeUrl, loginUrl, registerUrl} from '../urls'
import {ResponseSchema} from '../../response/response'

const user = new Router()

user.post(registerUrl, async ctx => {
  const body: RegisterBody = ctx.request.body
  await checkParams(ctx, registerSchema, body, 1001)
  let emailCode, sessionData
  try {
    sessionData = JSON.parse(await client.get(body.email) as string) as SessionData
    emailCode = sessionData.emailCode
  } catch (e) {
    return ctx.body = new ResponseSchema({message: '请先获取验证码', status: 1002})
  }
  if (!emailCode) return ctx.body = new ResponseSchema({message: '请先获取验证码', status: 1003})
  if ((sessionData?.emailCodeTime || Infinity) < Date.now() - 600000) return ctx.body = new ResponseSchema({message: '验证码已过期，请重新获取', status: 1004})
  if (body.code !== emailCode) return ctx.body = new ResponseSchema({message: '验证码错误', status: 1005})
  const {result} = await getEmailByUsernameOrEmail(ctx)
  if (result.length) return ctx.body = new ResponseSchema({message: result[0].email === body.email ? '该邮箱已注册' : '该用户名已存在', status: 1006})
  const {result: result2} = await addUser(ctx)
  ctx.body = new ResponseSchema({message: '注册成功'})
  const session = ctx.session!
  session.id = result2.insertId
  session.username = body.username
  session.loginTime = formatDate()
  session.login = true
})

user.get(getEmailCodeUrl, async ctx => {
  await checkParams(ctx, getEmailCodeSchema, ctx.request.query, 1007)
  const {email} = ctx.request.query as GetEmailCodeQuery
  const redisData = await client.get(email)
  if (redisData && JSON.parse(redisData).emailCodeTime > Date.now() - 60000) return ctx.body = new ResponseSchema({message: '1分钟内已发送过验证码，请一分钟后再尝试', status: 1008})
  await client.set(email, JSON.stringify({email, emailCode: '111111', emailCodeTime: Date.now()}))
  ctx.body = new ResponseSchema({message: '验证码已发送'})
})

user.post(loginUrl, async ctx => {
  const body = ctx.request.body as LoginReqBody
  await checkParams(ctx, loginSchema, body, 1009)
  const {result} = await getUserByLogin(ctx)
  if (!result.length) return ctx.body = new ResponseSchema({message: '用户名或密码错误', status: 1010})
  const session = ctx.session!
  session.id = result[0].id
  session.username = body.username
  session.loginTime = formatDate()
  session.login = true
  ctx.body = new ResponseSchema({message: '登录成功'})
})


export default user

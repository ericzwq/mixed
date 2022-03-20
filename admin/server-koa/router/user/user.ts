import {getEmailCodeSchema, loginSchema, registerSchema} from './user-schema'
import {querySql} from '../../db'
import Router = require('koa-router')
import {addUser, getEmailByUsernameOrEmail, getUserByLogin} from './user-sql'
import {GetEmailCodeQuery, LoginReqBody, RegisterBody, SessionData} from './user-types'
import client from '../../redis/redis'
import {formatDate} from '../../common/utils'

const user = new Router()

user.post('register', ctx => {
  const validation = registerSchema.validate(ctx.request.body)
  if (validation.error) return ctx.body = {message: validation.error.message, status: 1001}
  const body: RegisterBody = ctx.request.body
  return new Promise(resolve => {
    querySql(ctx, resolve).then(async con => {
      let emailCode, sessionData
      try {
        sessionData = JSON.parse(await client.get(body.email) as string) as SessionData
        emailCode = sessionData.emailCode
      } catch (e) {
        return resolve(ctx.body = {message: '请先获取验证码', status: 1002})
      }
      if (!emailCode) return resolve(ctx.body = {message: '请先获取验证码', status: 1003})
      if ((sessionData?.emailCodeTime || Infinity) < Date.now() - 600000) return resolve(ctx.body = {message: '验证码已过期，请重新获取', status: 1014})
      if (body.code !== emailCode) return resolve(ctx.body = {message: '验证码错误', status: 1004})
      getEmailByUsernameOrEmail(con, body, (err, res) => {
        if (err) return resolve(ctx.body = {message: '注册异常', status: 1005})
        if (res.length) return resolve(ctx.body = {message: res[0].email === body.email ? '该邮箱已注册' : '该用户名已存在', status: 1006})
        addUser(con, body, (err2, res2) => {
          if (err2) return resolve(ctx.body = {message: '注册失败', status: 1007})
          if (res2.affectedRows) ctx.body = {message: '注册成功', status: 0, data: true}
          else return ctx.body = {message: '注册失败！', status: 1008}
          const session = ctx.session as SessionData
          session.id = res2.insertId
          session.username = body.username
          session.loginTime = formatDate()
          session.login = true
          resolve(ctx.body)
        })
      })
    })
  })
})

user.get('getEmailCode', async ctx => {
  const validation = getEmailCodeSchema.validate(ctx.request.query)
  if (validation.error) return ctx.body = {message: validation.error.message, status: 1009}
  const {email} = ctx.request.query as GetEmailCodeQuery
  const redisData = await client.get(email)
  if (redisData && JSON.parse(redisData).emailCodeTime > Date.now() - 60000) return ctx.body = {message: '1分钟内已发送过验证码，请一分钟后再尝试', status: 1010}
  await client.set(email, JSON.stringify({email, emailCode: '111111', emailCodeTime: Date.now()}))
  ctx.body = {message: '验证码已发送', status: 0, data: true}
})

user.post('login', ctx => {
  const validation = loginSchema.validate(ctx.request.body)
  if (validation.error) return ctx.body = {message: validation.error.message, status: 1011}
  const body = ctx.request.body as LoginReqBody
  return new Promise(resolve => querySql(ctx, resolve).then(con => {
    getUserByLogin(con, body, (err, res) => {
      if (err) return resolve(ctx.body = {message: '登录异常', status: 1012})
      if (!res.length) return resolve(ctx.body = {message: '用户名或密码错误', status: 1013})
      const session = ctx.session as SessionData
      session.id = res[0].id
      session.username = body.username
      session.loginTime = formatDate()
      session.login = true
      resolve(ctx.body = {message: '登录成功', status: 0, data: true})
    })
  }))
})


export default user

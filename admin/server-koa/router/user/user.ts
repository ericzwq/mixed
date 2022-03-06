import {registerSchema} from './user-schema'
import {querySql} from '../../db'
import {Context} from 'koa'
import Router = require('koa-router')

const user = new Router()

user.post('register', (ctx: Context) => {
  const validation = registerSchema.validate(ctx.request.body)
  if (validation.error) return ctx.body = {message: validation.error.message, status: 1001}
  return new Promise(resolve => {
    querySql(ctx, resolve).then(con => {
      const {username, password, email} = ctx.request.body
      con.query('select email from users where username = ? or email = ? limit 1;', [username, email], (err, res) => {
        if (err) return resolve(ctx.body = {message: '注册失败', status: 1002})
        if (res.length) return resolve(ctx.body = {message: res[0].email === email ? '该邮箱已注册' : '该用户名已存在', status: 1003})
        con.query('insert users(username, password, email) values (?, ?, ?);', [username, password, email], (err2, res2) => {
          if (err2) return resolve(ctx.body = {message: '注册失败', status: 1004})
          if (!res2.fieldCount) ctx.body = {message: '注册成功', status: 0, data: true}
          else ctx.body = {message: '注册失败！', status: 1005}
          resolve(ctx.body)
        })
      })
    })
  })
})

user.post('login', (ctx: Context) => {
  console.log(ctx.request.body)
  ctx.body = 'ok'
})


export default user

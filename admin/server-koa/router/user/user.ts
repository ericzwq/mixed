import {checkParams} from '../../common'
import {registerCheckConfig} from './user-params-config'
import {querySql} from '../../db'
import {Context} from 'koa'

const Router = require('koa-router')

const user = new Router()

user.get('', (ctx: Context) => {
  ctx.body = 'cheese-web'
})

user.post('register', (ctx: Context) => {
  const {body} = ctx.request
  if (!checkParams(ctx, registerCheckConfig, body, 1001)) return
  return new Promise(resolve => {
    querySql(ctx).then(con => {
      con.query('select id from users where username = ?;', [body.username], (err, res) => {
        if (err) return resolve(ctx.body = {message: '注册失败', status: 1002})
        if (res.length) return resolve(ctx.body = {message: '用户名已存在', status: 1003})
        con.query(`insert users(username, password, email) values ('张三', '123456', '1234@163.com');`, (err, res2) => {
          if (!res2.fieldCount) ctx.body = '注册成功'
          else ctx.body = '注册失败！'
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

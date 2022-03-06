import {MysqlError, PoolConnection} from 'mysql'
import {Context} from 'koa'

const mysql = require('mysql')
const pool = mysql.createPool({
  // host: 'localhost',
  host: 'korea.cheeseocean.com',
  user: 'root',
  port: 3306,
  // password: '123456',
  password: 'xc514xxx',
  database: 'cheese_web',
  multipleStatements: true,
  timezone: '+08:00'
})
export const getLimitStr = function (query: any) {
  // if (!query.page || !query.count) throw Error('参数错误')
  let {page, count} = query
  if (!page) page = 1
  if (!count) count = 100
  return `LIMIT ${(page - 1) * count},${count}`
}
export const querySql = (ctx: Context, resolve: (value: unknown) => void) => new Promise<PoolConnection>(resolve2 => {
  pool.getConnection((err: MysqlError, connection: PoolConnection) => {
    if (err) {
      console.log(err)
      return resolve(ctx.body = {message: '数据库连接失败', status: 1000})
    }
    resolve2(connection)
    connection.release()
  })
})
export const totalRows = 'SQL_CALC_FOUND_ROWS'
export const selectTotal = 'SELECT FOUND_ROWS() as totalCount;'
export const paramsConfig = {
  courseName: {k: 'courseName', max: 10, type: 'string'},
  classroom: {k: 'classroom', max: 10, type: 'string'},
  courseId: {k: 'courseId'},
  teacherId: {k: 'teacherId'},
  studentId: {k: 'studentId'},
  maxCount: {k: 'maxCount', min: 1, max: 999},
  // score: {k: 'score', min: 0, max: 100},
  teacherName: {k: 'teacherName', max: 10, type: 'string'},
  // phone: {k: 'phone', fixed: 11},
  studentName: {k: 'studentName', max: 10, type: 'string'},
  id: {k: 'id'},
  level: {k: 'level', type: 'string'},
  // username: {k: 'username', type: 'string', max: 18},
  password: {k: 'password', type: 'string', max: 18, min: 6},
  newPsw: {k: 'newPsw', type: 'string', max: 18, min: 6},
  oldPsw: {k: 'oldPsw', type: 'string', max: 18, min: 6},
  invitation: {k: 'invitation', type: 'string', max: 54, min: 3},
  name: {k: 'name', type: 'string', max: 10},
  scoreIds: {k: 'scoreIds', type: 'array'},
  scoreId: {k: 'scoreId'},
  sex: {k: 'sex', type: 'string', max: 1},
  materialId: {k: 'materialId'},
  email: {k: 'email', type: 'email', max: 18},
  isRegister: {k: 'isRegister', type: 'enum', enum: ['0', '1']},
  classTime: {k: 'classTime', type: 'date'},
  verificationCode: {
    k: 'verificationCode', validator: (v: any) => {
      if (v.length !== 6) return {valid: false, m: '长度为6位'}
      return {valid: true}
    }
  }
}
export const upScoreDetailsDir = './bk-assets/upload/scoreDetails'

/*
* /api/public     无需验证
* /api/code       需验证邮箱验证码
* /api/authCode   需验证用户名的邮箱验证码
* /api/qr         二维码，需验证token
* /api/...        需验证token
*/

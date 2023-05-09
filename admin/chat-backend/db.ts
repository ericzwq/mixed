import {FieldInfo, MysqlError, PoolConnection} from 'mysql'
import {Middleware} from 'koa'
import {CustomQueryFunction, CustomSocketQueryFunction, PageParameter, SqlConfig} from './types/sql-types'
import {ResponseSchema} from './response/response'
import {ExtWebSocket} from "./socket/socket-types";
import {log} from "./common/utils";

const mysql = require('mysql')
const pool = mysql.createPool({
  host: 'localhost',
  // host: 'korea.cheeseocean.com',
  user: 'root',
  // port: 3306,
  password: '123456',
  // password: 'xc514xxx',
  database: 'chat',
  multipleStatements: true,
  timezone: '08:00'
})
export const getLimitSql = function (query: PageParameter) {
  let {pageIndex, pageSize} = query
  if (!pageIndex) pageIndex = '1'
  if (!pageSize) pageSize = '100'
  return `LIMIT ${(+pageIndex - 1) * +pageSize},${pageSize}`
}

export const sqlMiddleware: Middleware = (context, next) => {
  return new Promise<void>((resolve, reject) => {
    pool.getConnection(async (err: MysqlError, connection: PoolConnection) => {
      if (err) {
        log('数据库连接失败2：', err)
        reject(err)
        return context.body = new ResponseSchema({message: '数据库连接失败', status: 1000})
      }
      context.connection = connection
      await next()
      resolve()
      connection.release()
    })
  })
}

export const executeSql: CustomQueryFunction = function (ctx, options, values?, sqlConfig?: SqlConfig) {
  if (arguments.length === 3) {
    if (!(values instanceof SqlConfig)) { // (ctx, options, values)
      // sqlConfig = new SqlConfig()
    } else { // (ctx, options, sqlConfig)
      // sqlConfig = values
      values = undefined
    }
  } else if (arguments.length === 2) {
    // sqlConfig = new SqlConfig()
  }
  return new Promise((resolve, reject) => {
    const query = ctx.connection.query(options, values, (error: MysqlError | null, result: any, fields: FieldInfo[] | undefined) => {
      if (error) {
        log('数据库执行失败2:', error)
        ctx.connection.query('rollback;')
        ctx.body = new ResponseSchema({message: '数据库执行失败', status: 999})
        reject({query, error, fields})
      } else {
        resolve({query, result, fields})
      }
    })
  })
}

export const socketSqlMiddleware = (ws: ExtWebSocket) => {
  return new Promise<void>((resolve, reject) => {
    pool.getConnection((err: MysqlError, connection: PoolConnection) => {
      if (err) {
        log('数据库连接失败：', err)
        reject(err)
        return ws.json({message: '数据库连接失败', status: 1001})
      }
      ws.connection = connection
      resolve()
    })
  })
}

export const executeSocketSql: CustomSocketQueryFunction = function (ws: ExtWebSocket, options, values?, sqlConfig?: SqlConfig) {
  if (arguments.length === 3) {
    if (!(values instanceof SqlConfig)) { // (ctx, options, values)
      // sqlConfig = new SqlConfig()
    } else { // (ctx, options, sqlConfig)
      // sqlConfig = values
      values = undefined
    }
  } else if (arguments.length === 2) {
    // sqlConfig = new SqlConfig()
  }
  return new Promise((resolve, reject) => {
    const query = ws.connection.query(options, values, (error: MysqlError | null, result: any, fields: FieldInfo[] | undefined) => {
      if (error) {
        log('数据库执行失败:', error)
        ws.connection.query('rollback;')
        ws.json({message: '数据库执行失败', status: 998})
        reject({query, error, fields})
      } else {
        resolve({query, result, fields})
      }
      // log(query.sql)
    })
  })
}

export const beginSocketSql = async (ws: ExtWebSocket) => {
  await executeSocketSql(ws, 'begin;')
  ws.sqlCommit = true
}

export const commitSocketSql = async (ws: ExtWebSocket) => {
  await executeSocketSql(ws, 'commit;')
  ws.sqlCommit = false
}

export const totalRows = 'SQL_CALC_FOUND_ROWS'
export const selectTotal = 'SELECT FOUND_ROWS() as totalCount;'

import {ParsedUrlQuery} from 'querystring'
import {FieldInfo, OkPacket, Query, QueryOptions} from 'mysql'
import {Context} from 'koa'
import {ExtWebSocket} from "../socket/socket-types";

export type PageIndex = string
export type PageSize = string

export class SqlConfig {

  constructor() {

  }
}

export interface SqlReturn<T> {
  query: Query,
  result: T,
  fields?: FieldInfo[]
}

export interface CustomQueryFunction {
  <T = any>(ctx: Context, query: Query, config?: SqlConfig): Promise<SqlReturn<T>>;

  <T = any>(ctx: Context, options: string | QueryOptions, config?: SqlConfig): Promise<SqlReturn<T>>;

  <T = any>(ctx: Context, options: string | QueryOptions, values: any, config?: SqlConfig): Promise<SqlReturn<T>>;
}

export interface CustomSocketQueryFunction {
  <T = any>(ws: ExtWebSocket, query: Query, config?: SqlConfig): Promise<SqlReturn<T>>;

  <T = any>(ws: ExtWebSocket, options: string | QueryOptions, config?: SqlConfig): Promise<SqlReturn<T>>;

  <T = any>(ws: ExtWebSocket, options: string | QueryOptions, values: any, config?: SqlConfig): Promise<SqlReturn<T>>;
}

export interface PageParameter extends ParsedUrlQuery {
  pageIndex: PageIndex
  pageSize: PageSize
}

// 数据库新增返回示例
// OkPacket {
//     fieldCount: 0,
//     affectedRows: 1,
//     insertId: 5,
//     serverStatus: 2,
//     warningCount: 0,
//     message: '',
//     protocol41: true,
//     changedRows: 0
// }


// 数据库删除返回示例
// OkPacket {
//     fieldCount: 0,
//     affectedRows: 1,
//     insertId: 0,
//     serverStatus: 34,
//     warningCount: 0,
//     message: '',
//     protocol41: true,
//     changedRows: 0
// }

// 数据库查询列表的回调
export type SelectListModel<T> = [T[], [{ totalCount: number }]]

export type InsertModal = OkPacket

export type UpdateModal = OkPacket

export type DeleteModal = OkPacket

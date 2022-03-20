import {ParsedUrlQuery} from 'querystring'
import {FieldInfo, MysqlError} from 'mysql'

export type PageIndex = string
export type PageSize = string

export interface PageParameter extends ParsedUrlQuery {
  pageIndex: PageIndex
  pageSize: PageSize
}

// 数据库查询返回结构
export type SelectData<T = any> = T[]
// 数据库新增返回结构
// 成功示例
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
export interface InsertData {
  fieldCount: number,
  affectedRows: number,
  insertId: number,
  serverStatus: number,
  warningCount: number,
  message: string,
  protocol41: boolean,
  changedRows: number
}

// 数据库查询的重写回调，参考mysql库的queryCallback。去除了results的可选操作（懒得非空断言），使用results时先判断err是否存在
export interface SelectQueryCallback<T = any> {
  (err: MysqlError | null, results: T[], fields?: FieldInfo[]): void;
}

// 数据库查询列表的回调
export interface SelectQueryListCallback<T = any> {
  (err: MysqlError | null, results: [T[], [{ totalCount: number }]], fields?: FieldInfo[]): void;
}

// 数据库新增的重写回调
export interface InsertQueryCallback {
  (err: MysqlError | null, results: InsertData, fields?: FieldInfo[]): void;
}

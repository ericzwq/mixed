// 条件判断---------------------------------------------------------------------------------------------------------------
type IsNumber<T> = T extends number ? true : false
// 递归生成固定数量数组---------------------------------------------------------------------------------------------------------------
type CreateArray<len extends number, T, arr extends T[] = []> = arr["length"] extends len ? arr : CreateArray<len, T, [T, ...arr]>
type String2Len = CreateArray<2, string>
const strs: String2Len = ['str', 'str2']
// 字符串---------------------------------------------------------------------------------------------------------------
type S = 'abcd'
type Is<T> = T extends `ab${infer b}` ? b : never
const a: Is<'abc'> = 'c'
// 对象---------------------------------------------------------------------------------------------------------------
type Obj = {
  a: string
  b: number
}
const obj: Obj = {
  a: '1',
  b: 2
}
type Obj2 = {
  [key in keyof Obj]: string
}
const obj2: Obj2 = {
  a: '3',
  b: '4'
}
// 类型取值---------------------------------------------------------------------------------------------------------------
type TupleMapId<T extends { id: any }[]> = T[keyof T & number]['id']

type ActionId = TupleMapId<[{
  id: 1,
  name: 'user1'
},
  {
    id: 2,
    name: 'user2'
  },
  {
    id: 3,
    name: 'user3'
  }]>


// const action = [
//   {
//     id: 0,
//     type: '编辑'
//   },
//   {
//     id: 1,
//     type: '删除'
//   },
//   {
//     id: 2,
//     type: '禁用'
//   }
// ] as const
//
// type ActionId = typeof action[number]['id']

// 过滤属性类型----------------------------------------------------------------------------------------------------------
type filterNumberProp<T extends Object> = {
  [Key in keyof T]: T[Key] extends number ? T[Key] : never
}[keyof T]

type r = filterNumberProp<{
  a: 1
  b: '2',
  c: 3
}>


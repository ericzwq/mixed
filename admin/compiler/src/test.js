// 形参默认值
// 解构赋值，new，if，for，while，预解析，类，无限大，nan
import types from '@babel/types'

export default class Test {
  static memberExpression = 'window.console.log(arguments, this)'
  static objectFormalParameter = `
    const k = 'key'
    function f({[k]: a = 1, b, c = 2, d: {e: {f: g = 1, h: i} = {}} = {}} = {}, [] = []) {
      
    }
    f({key: 5})
  `
  static arrayFormalParameter = `
    const k = 'key'
    function f([{a: {b = 4, c: d = 5, f} = {y: 2}} = {x: 1}, [g, [h] = [k + 2, 7]] = [8]] = [3]) {
      
    }
    f()
  `
  static fnThis = `
    const o = {
      f: async () => {
        console.log(this)
      }
    }
    const o2 = {o2: 2}
    o.f()
    o.f.call(o2)
    o.f.bind(o2)()
    
    const o3 = {
      f: async function () {
        console.log(this)
      }
    }
    o3.f()
    o3.f.call(o2)
    o3.f.bind(o2)()
  `
  static arrowFnThis = `
    function d() {
      const o = {
        c: {
          f: async (a, b = 5, ...args) => {
            console.log(arguments, this)
            return 6
          }
        }
      }
      o.c.f(undefined, 2, 3)
    }
    d()
    const o = {
      d
    }
    o.d(6)
  `
  static spread = `
    const k = 'key'
    const o = {a: 1, get f() { return 5 }, [k]: 4, ...{a: 6}, set f(v) {}}
    const o2 = {a: 2, ...o, a: 3}
    console.log({...o}, o2)
    const f = () => Math.random()
    const a = [1, 2, f()]
    const a2 = [0, ...a, null]
    console.log([...a], a2)
  `
  static objectExpression = `
    const k = 'key'
    const o = {
      age: 3,
      f() {},
      set [k](v) {
        console.log('set', this)
      },
      get [k]() {
        console.log('get', this)
        return 2
      }
    }
    o[k] = 1
    console.log(o[k])
  `
  static deconstruct = `
    const k = 'key'
    const o = {
      age: 3,
      s: '2',
      f() {},
      [k]: k
    }
    let a, b, c, d, e, f, g, obj;
    ({[k]: a, c = 1, x: {e, y: f, ...g} = {e: 4, z: 0, age: 2}, age: b, p: d, base: d, ...obj} = {a: 1, ...o}); // 对象解构
//    [a = 2, ...[c]] = [1, 3, 4] // 数组解构 todo
    console.log(a, b, c, d, e, f, g, obj)
  `
  static assignmentExpression = `
    let k = 'a'
    let o = {
      a : 1, b : 1, c : 1, d : 1
    }, e
    o[k] += 1
    o.b -= 1
    o.c *= 1
    o.d /= 1
    o.e = 5
    e = o[k]
    console.log(o, e)
  `
  static forward = `
    const o = {a: 3}
    function f({a} = o) {
      console.log(a)
    }
    f()
  `
}
const k = 'key'
const o = {
  age: 3,
  s: '2',
  f() {
  },
  [k]: k
}
let a, b, c, d, e, ff, g, obj
//({c = 1, x: {e, y: ff, ...g} = {e: 4, z: 0}, age: b, p: d, base: d, ...obj} = {a: 1, ...o});
console.log(a, b, c, d, e, ff, g, obj, o)

// 形参默认值
// break continue, switch,case,default   for，while，do while，预解析，类，三元, 二进制，bigint, 模板字符串  else if
import types from '@babel/types'

export default class Test {
  static memberExpression = 'window.console.log(arguments, this)'
  //  object参数解构赋值
  static objectFormalParameter = `
    const k = 'key'
    function f({[k]: a = 1, b, c = 2, d: {e: {f: g = 1, h: i} = {}} = {}, ...rest} = {}, [] = [], ...rest2) {
      console.log(a, b, c, g, i, rest, rest2)
    }
    f({key: 5, age: 1}, undefined, 7, 8)
  `
  //  array参数解构赋值
  static arrayFormalParameter = `
    const k = 'key'
    function f([, {a: {b = 4, c: d = 5, f, ...i} = {y: 2}} = {x: 1}, [g, [h] = [k + 2, 7], ...j] = [8, , 7, 6, , 5]] = [2]) {
      console.log(b, d, f, g, h, i, j)
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
    o.f() // window
    o.f.call(o2) // window
    o.f.bind(o2)() // window
    
    const o3 = {
      f: async function () {
        console.log(this)
      }
    }
    o3.f() // o3
    o3.f.call(o2) // o2
    o3.f.bind(o2)() // o2
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
  //  展开运算符
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
  //  对象表达式
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
  // 解构赋值
  static deconstructAssignment = `
    const k = 'key'
    const o = {
      age: 3,
      s: '2',
      f() {},
      [k]: k
    }
    let a, b, c, d, e, f, g, obj;
//    ({[k]: a, c = 1, x: {e, y: f, ...g} = {e: 4, z: 0, age: 2}, age: b, p: d, base: d, ...obj} = {a: 1, ...o}); // 对象解构
    [,a, [b = 2, {c, d = 3, ...e} = {c: 1, e: 4}, ...g] = [0, 7, 8,,], ...f] = [0, 1,, 3, 4];
    console.log(a, b, c, d, e, f, g, obj)
  `
  // 赋值
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
  // 变量声明解构赋值
  static varDeconstructAssignment = `
    const k = 'key'
//    let {[k]: a, c = 1, x: {e, y: f, ...g} = {e: 4, z: 0, age: 2}, age: b, p: d, ...obj} = {a: 1, ...{age: 2}}, x = 1, y;
    let [,a, [b = 2, {c, d = 3, ...e} = {c: 1, e: 4}, ...g] = [0, 7, 8,,], ...f] = [0, 1,, 3, 4], x = NaN, y, obj = {age: Infinity};
    console.log(a, b, c, d, e, f, g, obj, x, y)
  `
  // 函数定义时的名称（webpack打包后可能有问题）
  static fnName = `
    const k = 'key'
    const a = function aa() {}
    console.log(new a())
    const b = function () {}
    console.dir(b)
    const c = () => {}
    console.dir(c)
    const o = {
      [k + 1]() {},
      [k + 2]: function () {},
      [k + 3]: function d() {},
      [k + 4]: () => {}
    }
    console.log(o)
    function fn() {
      this.age = 18
      console.log(this)
    }
    console.dir(new fn())
    console.dir(function () {})
    console.dir(() => {})
  `
  static ifStatement = `
    function ff() {return 3}
    let a = (() => ff())()
    if (a) console.log(a, 9)
    function fn() {
      let a = 1
      if (a) {
        console.log(2)
        if (true) {
          console.log(3)
          if (false) {
            return 7
          } else {
            return 6
          }
          console.log(4)
        }
        return 4
      } else {
        console.log(3)
        return 5
      }
      console.log(88)
    }
    console.log(fn())
  `
  static forStatement = `
    let s = ''
    label3: for (let y = 0; y < 10; y++) {
      if (y === 4) break label3
      if (y === 5) continue
      console.log('%cyy', 'color: green', y)
      s += 'yy' + y + ';'
      label0: for (let x = 0; x < 10; x++) {
        if (x === 7) break label0
        if (x === 2) continue label3
        console.log('%cxx', 'color: red', x)
        s += 'xx:' + x + ';'
        label1: for (let j = 0; j < 10; j++) {
          console.log('%cjj', 'color: blue', j)
          s += 'jj:' + j + ';'
          if (j === 5) break label0
          if (j === 6) break label1
          if (j === 7) continue label3
          if (j === 8) break
          if (j === 9) continue
          label2: for (let i = 0; i < 10; i++) {
            if (i === 3) break label2
            if (i === 1) continue label1
            if (i === 7) continue label0
            if (i === 8) break label3
            if (i === 9) break
            console.log('ii', i)
            s += 'ii:' + i + ';'
          }
        }
      }
    }
    console.log(s)
  `
  static forward = `
    let p = new Promise(resolve => setTimeout(() => resolve(5), 500));
    let p2 = new Promise(resolve => setTimeout(() => resolve(6), 1000));
    console.log(p)
    Promise.all([p, p2]).then(r => console.log(r));
//    (async function () {
//      let a
//      a = await 1
//      console.log(a)
//    })()
  `
  static forward2 = `
    (async function () {
      console.log(1)
      const r = await new Promise(resolve => setTimeout(() => resolve(2)), 500)
      console.log(r)
      const ps = Promise.resolve([[1], [2], [3], [4]])
      label: for (let i = 0; i < 5; i++) {
        for (const [v] of await ps) {
          if (v === 2) continue label
          if (v === 4) break label
          console.log(v)
        }
      }
  })()
  `
}
'use strict'

//let p = new Promise(resolve => setTimeout(() => resolve(5), 500));
//let p2 = new Promise(resolve => setTimeout(() => resolve(6), 1000));
//Promise.all([p, p2]).then(r => console.log(r));
//(async function () {
//  let a
//  a = await 1
//  console.log(a)
//})()

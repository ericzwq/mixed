import {parse} from '@babel/core'
import {each} from './utils'
import Test from './test'

const ast = parse(Test.deconstruct)
const s = JSON.stringify(ast, function (k, v) {
  if (v) {
    delete v.loc
    delete v.start
    delete v.end
  }
  return v
})
console.log(s)
const global = Object.create(null, {_parent: {value: null}, 'this': {value: window}})
window.global = global

class JSVM {
  logicalExpressionMap = {
    '||': (a, b) => a || b,
    '&&': (a, b) => a && b,
  }
  binaryExpressionMap = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => a / b,
    '%': (a, b) => a % b,
    '**': (a, b) => a ** b,
    '&': (a, b) => a & b,
    '|': (a, b) => a | b,
    '>>': (a, b) => a >> b,
    '>>>': (a, b) => a >>> b,
    '<<': (a, b) => a << b,
    '^': (a, b) => a ^ b,
    '==': (a, b) => a == b,
    '===': (a, b) => a === b,
    '!=': (a, b) => a != b,
    '!==': (a, b) => a !== b,
    'in': (a, b) => a in b,
    'instanceof': (a, b) => a instanceof b,
    '>': (a, b) => a > b,
    '<': (a, b) => a < b,
    '>=': (a, b) => a >= b,
    '<=': (a, b) => a <= b,
  }

  assignmentExpressionMap = {
    '=': (a, b) => b,
    '+=': (a, b) => a + b,
    '-=': (a, b) => a - b,
    '/=': (a, b) => a / b,
    '*=': (a, b) => a * b,
    '^=': (a, b) => a ^ b,
    '&=': (a, b) => a & b,
    '|=': (a, b) => a | b,
  }

  unaryExpressionMap = {
    '+': a => +a,
    '-': a => -a,
    '!': a => !a,
    '~': a => ~a,
    'delete': (_, ctx, node) => {
      if (node.type === 'MemberExpression') {
        node.kind = 'delete'
        return this.MemberExpression(ctx, node)
      } else {
        throw Error('不支持的 delete 操作')
      }
    },
    'typeof': a => typeof a,
    'void': a => void a,
    'throw': a => { // never
      throw a
    },
  }

  handler(ctx, node, parent) {
    if (arguments.length !== 3) throw Error('handler需要3个参数')
    if (typeof this[node.type] !== 'function') throw Error(`${node.type} 不是函数`)
    return this[node.type](ctx, node, parent)
  }

  Identifier(ctx, node) { // 变量
    const {name} = node
    while (ctx && !(name in ctx)) { // 查找上级作用域
      ctx = ctx._parent
    }
    ctx = ctx || window // 最后查全局作用域
//    if (!ctx) {
//      if (name in window) return window[name] // 最后查全局作用域
//      throw Error(`找不到变量 ${name}`)
//    }
//    if (parent.type === 'AssignmentExpression') {
//      console.log(ctx, node, parent)
//      return ctx[name] = this.handler(ctx, node.right, node)
//    }
    return ctx[name]
  }

  CallExpression(ctx, node) {
    const {callee, arguments: args} = node
    if (callee.type !== 'MemberExpression') return this.handler(ctx, callee, node)(...args.map(argument => this.handler(ctx, argument, node)))
    return this.handler(ctx, callee.object, node)[callee.property.name](...args.map(argument => this.handler(ctx, argument, node))) // this指向
  }

  // 处理成员表达式
  _memberExpressionHandler = {
    undefined(vm, ctx, node, key) { // 取值模式（默认）
      return vm.handler(ctx, node.object, node)[key]
    },
    delete(vm, ctx, node, key) { // 删除模式
      return delete vm.handler(ctx, node.object, node)[key]
    },
    assign(vm, ctx, node, key) { // 赋值模式
      const o = vm.handler(ctx, node.object, node)
      return o[key] = vm.assignmentExpressionMap[node.operator](o[key], node.value)
    }
  }

  MemberExpression(ctx, node) {
    const {property, kind} = node
    const key = !node.computed ? property.name : this.handler(ctx, property, node)
    return this._memberExpressionHandler[kind](this, ctx, node, key) // kind为自定义字段
  }

  _assignmentExpressionHandler = {
    handler(vm, ctx, left, right, operator, usedKeys, assign) {
      if (arguments.length !== 7) throw Error('参数错误') // todo
      this[left.type](vm, ctx, left, right, operator, usedKeys, assign)
    },
    Identifier(vm, ctx, left, right, operator) {
      return ctx[left.name] = vm.assignmentExpressionMap[operator](ctx[left.name], right)
    },
    MemberExpression(vm, ctx, left, right, operator) {
      left.kind = 'assign'
      left.value = right
      left.operator = operator
      return vm.MemberExpression(ctx, left)
    },
    ObjectPattern(vm, ctx, left, right, operator, usedKeys, assign) {
      const _usedKeys = new Set() // 新的对象，重新记录解构的key
      const fn = assign ?
        (property, key) => this.handler(vm, ctx, property.value, right[key], operator, _usedKeys, false)
        : (property, key) => ctx[property.value.name] = right[key]

      each(left.properties, property => {
        if (property.type === 'ObjectProperty') {
          const key = vm.getObjectKey(ctx, property)
          usedKeys.add(key)
          return fn(property, key)
        }
        // RestElement
        const rest = {...right}
        each(Object.keys(right), key => usedKeys.has(key) ? delete rest[key] : 0)
        ctx[property.argument.name] = rest
      })
    },
    ArrayPattern(vm, ctx, left, right, operator, usedKeys) {
      for (let i = 0; i < left.elements.length; i++) {
        this.handler(vm, ctx, left.elements[i], right[i], operator, usedKeys, false)
      }
    },
    AssignmentPattern(vm, ctx, _left, _right, operator, usedKeys) {
      const {left, right} = _left
      if (_right === undefined) _right = vm.handler(ctx, right, _left) // 参数默认值
      this.handler(vm, ctx, left, _right, operator, usedKeys, true)
    },
    RestElement(vm, ctx, left, right, operator, usedKeys) {
      ctx[left.argument.name] = usedKeys
    }
  }

  AssignmentExpression(ctx, node) {
    const {left, operator, right} = node
    return this._assignmentExpressionHandler.handler(this, ctx, left, this.handler(ctx, right, node), operator, new Set(), true)
  }

  ExpressionStatement(ctx, node) {
    return this.handler(ctx, node.expression, node)
  }

  File(ctx, node) {
    return this.handler(ctx, node.program, node)
  }

  VariableDeclaration(ctx, node) {
    each(node.declarations, ({type, id, init}) => {
      if (type !== 'VariableDeclarator') throw Error('非预期的类型') // todo
      ctx[id.name] = init ? this.handler(ctx, init, node) : undefined
    })
  }

  LogicalExpression(ctx, node) {
    const {left, operator, right} = node
    return this.logicalExpressionMap[operator](this.handler(ctx, left, node), this.handler(ctx, right, node))
  }

  BinaryExpression(ctx, node) {
    const {left, operator, right} = node
    return this.binaryExpressionMap[operator](this.handler(ctx, left, node), this.handler(ctx, right, node))
  }

  UnaryExpression(ctx, node) {
    const {operator, argument} = node
    return this.unaryExpressionMap[operator](this.handler(ctx, argument, node), ctx, argument)
  }

  NumericLiteral(ctx, node) {
    return node.value
  }

  ReturnStatement(ctx, node) {
    return this.handler(ctx, node.argument, node)
  }

  StringLiteral(ctx, node) {
    return node.value
  }

  Program(ctx, node) {
    each(node.body, body => this.handler(ctx, body, node))
  }

  async AwaitExpression(ctx, node) {
    return await this.handler(ctx, node.argument, node)
  }

  // 处理形参
  formalParamsHandler(ctx, params, args) {
    const l = params.length
    const restArgs = args.slice(l - 1)
    for (let i = 0; i < l; i++) {
      this._formalParamsHandler.handler(this, ctx, params[i], args[i], restArgs, false)
    }
  }

  getObjectKey(ctx, node) {
    // computed 是否需计算
    return !node.computed ? node.key.name : this.handler(ctx, node.key, node)
  }

  _formalParamsHandler = {
    handler(vm, ctx, node, argument, restArgs, assign) {
      if (arguments.length !== 6) throw Error('参数错误') // todo
      this[node.type](vm, ctx, node, argument, restArgs, assign)
    },
    Identifier(vm, ctx, node, argument) {
      return ctx[node.name] = argument
    },
    ObjectPattern(vm, ctx, node, argument, restArgs, assign) {
      if (assign) { // 上一步已赋参数默认值，此时不再赋值，变量交给Identifier赋值
        each(node.properties, property => this.handler(vm, ctx, property.value, argument[vm.getObjectKey(ctx, property)], restArgs, false))
      } else { // 上一步不是赋值模式，直接从目标对象中取属性
        each(node.properties, property => ctx[property.value.name] = argument[vm.getObjectKey(ctx, property)])
      }
    },
    ArrayPattern(vm, ctx, node, argument, restArgs) {
      for (let i = 0; i < node.elements.length; i++) {
        this.handler(vm, ctx, node.elements[i], argument[i], restArgs, false)
      }
    },
    AssignmentPattern(vm, ctx, node, argument, restArgs) {
      const {left, right} = node
      if (argument === undefined) argument = vm.handler(ctx, right, node) // 参数默认值
      this.handler(vm, ctx, left, argument, restArgs, true)
    },
    RestElement(vm, ctx, node, argument, restArgs) {
      ctx[node.argument.name] = restArgs
    }
  }

  FunctionDeclaration(ctx, node) {
    ctx[node.id.name] = this.FunctionExpression(ctx, node)
  }

  FunctionExpression(ctx, node) {
    const _this = this
    const generateFnBody = function (args, context) {
      const blockCtx = Object.create(null, {'_parent': {value: ctx}, 'this': {value: context}, 'arguments': {value: args}})
      _this.formalParamsHandler(blockCtx, node.params, Array.from(args))
      return _this.handler(blockCtx, node.body, node)
    }
    if (!node.async) {
      return function () { // 使用js的属性点方式绑定this
        return generateFnBody(arguments, this)
      }
    } else {
      return async function () {
        return generateFnBody(arguments, this)
      }
    }
  }

  ArrowFunctionExpression(ctx, node) {
    const blockCtx = Object.create(null, {'_parent': {value: ctx}})
    if (!node.async) {
      return (...args) => {
        this.formalParamsHandler(blockCtx, node.params, args)
        return this.handler(blockCtx, node.body, node)
      }
    } else {
      return async (...args) => {
        this.formalParamsHandler(blockCtx, node.params, args)
        return this.handler(blockCtx, node.body, node)
      }
    }
  }

  NewExpression(ctx, node) {
    const callee = this.handler(ctx, node.callee, node)
    return new callee(...node.arguments.map(argument => this.handler(ctx, argument, node)))
  }

  // 处理不同的函数类型kind type: ObjectMethod
  _kindMethodHandler = {
    handler(vm, ctx, node, o, key) {
      this[node.kind](vm, ctx, node, o, key)
    },
    getDescriptor(o, key) {
      return Object.getOwnPropertyDescriptor(o, key) || {
        configurable: true,
        enumerable: true,
      }
    },
    method(vm, ctx, node, o, key) {
      o[key] = vm.FunctionExpression(ctx, node)
    },
    get(vm, ctx, node, o, key) {
      const descriptor = this.getDescriptor(o, key)
      descriptor.get = vm.FunctionExpression(ctx, node)
      Object.defineProperty(o, key, descriptor)
    },
    set(vm, ctx, node, o, key) {
      const descriptor = this.getDescriptor(o, key)
      descriptor.set = vm.FunctionExpression(ctx, node)
      Object.defineProperty(o, key, descriptor)
    },
  }
  // 处理对象表达式 type: ObjectExpression
  _objectExpressionHandler = {
    handler(vm, ctx, o, node) {
      return this[node.type](vm, ctx, o, node)
    },
    ObjectProperty(vm, ctx, o, node) { // 属性
      o[vm.getObjectKey(ctx, node)] = vm.handler(ctx, node.value, node)
      return o
    },
    ObjectMethod(vm, ctx, o, node) { // 方法
      const key = vm.getObjectKey(ctx, node)
      vm._kindMethodHandler.handler(vm, ctx, node, o, key)
      return o
    },
    SpreadElement(vm, ctx, o, node) { // 展开运算符
      return Object.assign(o, vm.handler(ctx, node.argument, node))
    }
  }

  ObjectExpression(ctx, node) {
    return node.properties.reduce((acc, cur) => this._objectExpressionHandler.handler(this, ctx, acc, cur), {})
  }

  ThisExpression(ctx) {
    while (ctx && !('this' in ctx)) ctx = ctx._parent
    return ctx?.this
  }

  // 函数体或代码块
  BlockStatement(ctx, node, parent) {
    const blockCtx = !['ArrowFunctionExpression', 'FunctionDeclaration'].includes(parent.type) ? Object.create(null, {_parent: {value: ctx}}) : ctx // 如果不是函数声明里的，添加块级作用域
    for (let i = 0, l = node.body.length; i < l; i++) {
      const body = node.body[i]
      if (body.type === 'ReturnStatement') return this.handler(blockCtx, body.argument, node)
      this.handler(blockCtx, body, node)
    }
  }

  BooleanLiteral(ctx, node) {
    return node.value
  }

  NullLiteral() {
    return null
  }

  ArrayExpression(ctx, node) {
    const elements = []
    each(node.elements, element => {
      if (element.type !== 'SpreadElement') return elements.push(this.handler(ctx, element, node)) // 展开运算符
      elements.push(...this.handler(ctx, element.argument, element))
    })
    return elements
  }

  ThrowStatement(ctx, node) {
    throw this.handler(ctx, node.argument, node)
  }

  IfStatement(node) {

  }
}

new JSVM().handler(global, ast, null)

import {parse} from '@babel/core'
import Test from './test'

const ast = parse(Test.forward)
const s = JSON.stringify(ast, function (k, v) {
  if (v) {
    delete v.loc
    delete v.start
    delete v.end
  }
  return v
})
console.log(s)

//window.global = context

class JSVM {
  global
  context

  constructor(global = window) {
    this.global = global
    this.context = Object.create(null, {'_parent': {value: null}, 'this': {value: global}})
  }

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
        node['kind'] = 'delete'
        return this.MemberExpression(ctx, node)
      } else {
        return delete this.handler(ctx, node)
      }
    },
    'typeof': a => typeof a,
    'void': a => void a,
    'throw': a => { // never
      throw a
    },
  }
  updateExpressionMap = {
    '++true': (o, key) => ++o[key],
    '++false': (o, key) => o[key]++,
    '--true': (o, key) => --o[key],
    '--false': (o, key) => o[key]--,
  }

  async handler(ctx, node) { // 返回给主函数的结果需要包裹，主函数返回不包裹
    if (arguments.length !== 2) throw Error('handler需要2个参数')
    if (typeof this[node.type] !== 'function') throw Error(`${node.type} 不是函数`)
    return this[node.type](ctx, node)
  }

  findIdentifierAndCtx(ctx, node) {
    const name = node.name
    while (ctx && !(name in ctx)) ctx = ctx['_parent'] // 查找上级作用域
    ctx = ctx || this.global // 最后查全局作用域
    return [[ctx, name]]
    //    if (!ctx) {
//      if (name in this.global) return this.global[name] // 最后查全局作用域
//      throw Error(`找不到变量 ${name}`)
//    }
//    if (parent.type === 'AssignmentExpression') {
//      console.log(ctx, node, parent)
//      return ctx[name] = this.handler(ctx, node.right)
//    }
  }

  Identifier(ctx, node) { // 变量
    const [_ctx, name] = this.findIdentifierAndCtx(ctx, node)
    return [_ctx[name]]
  }

  async CallExpression(ctx, node) { // 返回的结果为函数调用结果，需要包裹返回
    const {callee, arguments: args} = node
    if (callee.type !== 'MemberExpression') return [(await this.handler(ctx, callee))[0](...args.map(async argument => (await this.handler(ctx, argument))[0]))]
    return [(await this.handler(ctx, callee.object))[0][callee.property.name](...args.map(async argument => (await this.handler(ctx, argument))[0]))] // this指向
  }

  // 处理成员表达式
  _memberExpressionHandler = {
    async undefined(vm, ctx, node, key) { // 取值模式（默认）
      return (await vm.handler(ctx, node.object))[0][key]
    },
    async delete(vm, ctx, node, key) { // 删除模式
      return delete (await vm.handler(ctx, node.object)[0])[key]
    },
    async assign(vm, ctx, node, key) { // 赋值模式
      const o = (await vm.handler(ctx, node.object))[0]
      return o[key] = vm.assignmentExpressionMap[node.operator](o[key], node.value)
    },
    async update(vm, ctx, node, key) { // 更新：++, --
      const {object, updateInfo: {prefix, operator}} = node
      const o = (await vm.handler(ctx, object))[0]
      return vm.updateExpressionMap[operator + prefix](o, key)
    }
  }

  async MemberExpression(ctx, node) { // _memberExpressionHandler的返回结果统一由当前函数包裹返回
    const {property, kind} = node
    const key = !node.computed ? property.name : (await this.handler(ctx, property))[0]
    return [await this._memberExpressionHandler[kind](this, ctx, node, key)] // kind为自定义字段
  }

  _assignmentExpressionHandler = { // 内部函数返回结果都不包裹
    async handler(vm, ctx, left, right, operatorOrRestArgs, assign) { // 公共方法
      if (arguments.length !== 6) throw Error('参数错误') // todo
      return this[left.type](vm, ctx, left, right, operatorOrRestArgs, assign)
    },
    async Identifier(vm, ctx, left, right, operator) {
      const [_ctx, name] = vm.findIdentifierAndCtx(ctx, left) // 可能是上级作用域的变量
      return _ctx[name] = vm.assignmentExpressionMap[operator](_ctx[name], right)
    },
    async MemberExpression(vm, ctx, left, right, operator) {
      left['kind'] = 'assign'
      left['value'] = right
      left['operator'] = operator
      return (await vm.MemberExpression(ctx, left))[0] // 解包裹
    },
    async ObjectPattern(vm, ctx, left, right, operatorOrRestArgs, assign) { // 公共方法
      const usedKeys = new Set() // 新的对象，重新记录解构的key
      for (let i = 0; i < left.properties.length; i++) {
        const property = left.properties[i]
        if (property.type === 'ObjectProperty') {
          const key = vm.getObjectKey(ctx, property)
          usedKeys.add(key)
          assign ?
            await this.handler(vm, ctx, property.value, right[key], operatorOrRestArgs, false) // 上一步已赋参数默认值，此时不再赋值，变量交给Identifier赋值
            : ctx[property.value.name] = right[key] // 上一步不是赋值模式，直接从目标对象中取属性
          continue
        }
        // 剩余元素
        const rest = {...right}
        const keys = Object.keys(right)
        for (let j = 0; j < keys.length; j++) {
          const key = keys[j]
          if (usedKeys.has(key)) delete rest[key]
        }
        ctx[property.argument.name] = rest
      }
      return right
    },
    async ArrayPattern(vm, ctx, left, right, operatorOrRestArgs) { // 公共方法
      for (let i = 0; i < left.elements.length; i++) {
        const element = left.elements[i]
        if (element === null) continue
        if (element.type !== 'RestElement') await this.handler(vm, ctx, element, right[i], operatorOrRestArgs, false)
        else await this.handler(vm, ctx, element.argument, [...right.slice(i)], operatorOrRestArgs, false) // 剩余元素
      }
      return right
    },
    async AssignmentPattern(vm, ctx, _left, _right, operatorOrRestArgs) { // 公共方法
      const {left, right} = _left
      if (_right === undefined) _right = vm.handler(ctx, right) // 参数默认值
      return this.handler(vm, ctx, left, _right, operatorOrRestArgs, true)
    }
  }

  async AssignmentExpression(ctx, node) { // 统一包裹
    const {left, operator, right} = node
    return [await this._assignmentExpressionHandler.handler(this, ctx, left, (await this.handler(ctx, right))[0], operator, true)]
  }

  async ExpressionStatement(ctx, node) {
    return this.handler(ctx, node.expression)
  }

  File(ctx, node) {
    return this.handler(ctx, node.program)
  }

  _variableDeclarationHandler = {
    handler: this._assignmentExpressionHandler.handler,
    Identifier(vm, ctx, id, init) {
      return ctx[id.name] = init
    },
    ObjectPattern: this._assignmentExpressionHandler.ObjectPattern,
    ArrayPattern: this._assignmentExpressionHandler.ArrayPattern,
    AssignmentPattern: this._assignmentExpressionHandler.AssignmentPattern,
  }

  VariableDeclaration(ctx, node) {
    for (let i = 0; i < node.declarations.length; i++) {
      let {id, init} = node.declarations[i]
      if (init !== null) init['fnName'] = id.name // 将变量名作为赋值对象的函数名（如果init是函数），如：const a = function () {}
      this._variableDeclarationHandler.handler(this, ctx, id, init !== null ? this.handler(ctx, init) : undefined, null, true)
    }
  }

  LogicalExpression(ctx, node) {
    const {left, operator, right} = node
    return this.logicalExpressionMap[operator](this.handler(ctx, left), this.handler(ctx, right))
  }

  BinaryExpression(ctx, node) {
    const {left, operator, right} = node
    return this.binaryExpressionMap[operator](this.handler(ctx, left), this.handler(ctx, right))
  }

  UnaryExpression(ctx, node) {
    const {operator, argument} = node
    return this.unaryExpressionMap[operator](this.handler(ctx, argument), ctx, argument)
  }

  /* _updateExpressionHandler = {
    MemberExpression(vm, ctx, node, prefix, operator) {
      node['kind'] = 'update'
      node['updateInfo'] = {prefix, operator}
      return vm.MemberExpression(ctx, node)
    },
    Identifier(vm, ctx, node, prefix, operator) {
      return vm.updateExpressionMap[operator + prefix](ctx, node.name)
    }
  } */

  UpdateExpression(ctx, node) { // todo
    const {operator, prefix, argument} = node
    if (argument.type === 'Identifier') { // 可能是上级作用域的变量
      const [_ctx, name] = this.findIdentifierAndCtx(ctx, argument)
      return this.updateExpressionMap[operator + prefix](_ctx, name)
    }
    argument['kind'] = 'update' // 目前认为是成员表达式：MemberExpression
    argument['updateInfo'] = {prefix, operator}
    return this.MemberExpression(ctx, argument)
//    return this._updateExpressionHandler[argument.type](this, ctx, argument, prefix, operator)
  }

  NumericLiteral(ctx, node) {
    return node.value
  }

  ReturnStatement(ctx, node) {
    return new this.Returned(this.handler(ctx, node.argument))
  }

  StringLiteral(ctx, node) {
    return node.value
  }

  Program(ctx, node) {
    for (let i = 0, l = node.body.length; i < l; i++) {
      this.handler(ctx, node.body[i])
    }
  }

  async AwaitExpression(ctx, node) {
    return await this.handler(ctx, node.argument)
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
    return !node.computed ? node.key.name : this.handler(ctx, node.key)
  }

  _formalParamsHandler = {
    handler: this._assignmentExpressionHandler.handler,
    /* handler(vm, ctx, node, argument, restArgs, assign) {
      if (arguments.length !== 6) throw Error('参数错误') // todo
      this[node.type](vm, ctx, node, argument, restArgs, assign)
    }, */
    Identifier(vm, ctx, node, argument) {
      return ctx[node.name] = argument
    },
    ObjectPattern: this._assignmentExpressionHandler.ObjectPattern,
    /* ObjectPattern(vm, ctx, node, argument, restArgs, assign) {
      const usedKeys = new Set()
      for (let i = 0; i < node.properties.length; i++) {
        const property = node.properties[i]
        if (property.type === 'ObjectProperty') {
          const key = vm.getObjectKey(ctx, property)
          usedKeys.add(key)
          assign ?
            this.handler(vm, ctx, property.value, argument[key], restArgs, false) // 上一步已赋参数默认值，此时不再赋值，变量交给Identifier赋值
            : ctx[property.value.name] = argument[key] // 上一步不是赋值模式，直接从目标对象中取属性
          continue
        }
        // 剩余元素
        const rest = {...argument}
        const keys = Object.keys(argument)
        for (let j = 0; j < keys.length; j++) {
          const key = keys[j]
          if (usedKeys.has(key)) delete rest[key]
        }
        ctx[property.argument.name] = rest
      }
    }, */
    ArrayPattern: this._assignmentExpressionHandler.ArrayPattern,
    /* ArrayPattern(vm, ctx, node, argument, restArgs) {
      for (let i = 0; i < node.elements.length; i++) {
        const element = node.elements[i]
        if (element.type !== 'RestElement') this.handler(vm, ctx, element, argument[i], restArgs, false)
        else this.handler(vm, ctx, element.argument, argument.slice(i), restArgs, false) // 剩余元素
      }
    }, */
    AssignmentPattern: this._assignmentExpressionHandler.AssignmentPattern,
    /* AssignmentPattern(vm, ctx, node, argument, restArgs) {
      const {left, right} = node
      if (argument === undefined) argument = vm.handler(ctx, right) // 参数默认值
      this.handler(vm, ctx, left, argument, restArgs, true)
    }, */
    RestElement(vm, ctx, node, argument, restArgs) { // 剩余参数
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
      node.body['function'] = true
      return _this.handler(blockCtx, node.body)?.data // 若有return，则必有data，若没有return，则返回为undefined
    }
    const name = node.id?.name ?? node['fnName']
    if (!node.async) {
      if (name === undefined) return function () { // 匿名函数
        return generateFnBody(arguments, this)
      }
      const o = {
        [name]: function () { // 保留定义时的函数名
          return generateFnBody(arguments, this)
        }
      }
      return o[name]
      /* return function () { // 使用js的属性点方式绑定this
        return generateFnBody(arguments, this)
      } */
    } else {
      if (name === undefined) return async function () { // 匿名函数
        return generateFnBody(arguments, this)
      }
      const o = {
        [name]: async function () {
          return generateFnBody(arguments, this)
        }
      }
      return o[name]
      /* return async function () {
        return generateFnBody(arguments, this)
      } */
    }
  }

  ArrowFunctionExpression(ctx, node) {
    const blockCtx = Object.create(null, {'_parent': {value: ctx}})
    node.body['function'] = true
    const name = node['fnName']
    if (!node.async) {
      if (name === undefined) return (...args) => {
        this.formalParamsHandler(blockCtx, node.params, args)
        const res = this.handler(blockCtx, node.body)
        return res instanceof this.Returned ? res.data : res
      }
      const o = { // 保留函数名
        [name]: (...args) => {
          this.formalParamsHandler(blockCtx, node.params, args)
          const res = this.handler(blockCtx, node.body)
          return res instanceof this.Returned ? res.data : res
        }
      }
      return o[name]
    } else {
      if (name === undefined) return async (...args) => {
        this.formalParamsHandler(blockCtx, node.params, args)
        const res = this.handler(blockCtx, node.body)
        return res instanceof this.Returned ? res.data : res
      }
      const o = { // 保留函数名
        [name]: async (...args) => {
          this.formalParamsHandler(blockCtx, node.params, args)
          const res = this.handler(blockCtx, node.body)
          return res instanceof this.Returned ? res.data : res
        }
      }
      return o[name]
    }
  }

  NewExpression(ctx, node) {
    const callee = this.handler(ctx, node.callee)
    return new callee(...node.arguments.map(argument => this.handler(ctx, argument)))
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
      node['fnName'] = key
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
      const key = vm.getObjectKey(ctx, node)
      node.value['fnName'] = key
      o[key] = vm.handler(ctx, node.value)
      return o
    },
    ObjectMethod(vm, ctx, o, node) { // 方法
      vm._kindMethodHandler.handler(vm, ctx, node, o, vm.getObjectKey(ctx, node))
      return o
    },
    SpreadElement(vm, ctx, o, node) { // 展开运算符
      return Object.assign(o, vm.handler(ctx, node.argument))
    }
  }

  ObjectExpression(ctx, node) {
    return node.properties.reduce((acc, cur) => this._objectExpressionHandler.handler(this, ctx, acc, cur), {})
  }

  ThisExpression(ctx) {
    while (ctx && !('this' in ctx)) ctx = ctx['_parent']
    return ctx?.this
  }

  // 代码块中返回
  Returned = class {
    data

    constructor(data) {
      this.data = data
    }
  }
  // 代码块中continue
  Continued = class {
    label

    constructor(label) {
      this.label = label
    }
  }
  // 代码块中break
  Broken = class {
    label

    constructor(label) {
      this.label = label
    }
  }

  // 函数体或代码块
  BlockStatement(ctx, node) {
    const blockCtx = node['function'] || node['for'] ? ctx : Object.create(null, {'_parent': {value: ctx}}) // 如果不是函数声明或for语句里的，添加块级作用域
    for (let i = 0, l = node.body.length; i < l; i++) {
      const body = node.body[i]
      if (body.type !== 'ReturnStatement') {
        const res = this.handler(blockCtx, body)
        if (res instanceof this.Returned || res instanceof this.Broken) return res // 返回为Returned表示内部已经return || 结束当前代码块。直接上抛标记类，终止上方的循环
        if (res instanceof this.Continued) return res.label === undefined ? undefined : res // 结束当前代码块。若没有label，跳出当前循环即可；若有label，则继续上抛标记类
      } else return new this.Returned(this.handler(blockCtx, body.argument))
    }
  }

  ForStatement(ctx, node) {
    const blockCtx = Object.create(null, {'_parent': {value: ctx}})
    const {init, test, update, body} = node
    body['for'] = true
    for (this.handler(blockCtx, init); this.handler(blockCtx, test); this.handler(blockCtx, update)) {
      const res = this.handler(blockCtx, body)
      if (res instanceof this.Returned) return res // 返回为Returned表示内部已经return
      if (res instanceof this.Broken) { // break直接跳出，若没有label，跳出当前循环即可，若有label且上级作用域不包含label，则继续上抛Broken标记类
        return (res.label === undefined || ctx['_labels']?.has(res.label)) ? undefined : res
      }
      if (res instanceof this.Continued) {
        if (res.label === undefined || ctx['_labels']?.has(res.label)) continue // 没有label或上级作用域包含返回的label，进入当前循环的下一轮循环
        return res // 该label需要上抛给上面的语句判断到哪里停止
      }
    }
  }

  ForOfStatement(ctx, node) {
    const blockCtx = Object.create(null, {'_parent': {value: ctx}})
    const {left, right, body} = node
    body['for'] = true
    console.log(this.handler(ctx, right))
    for (const value of this.handler(ctx, right)) {
      console.log(value)
      left.init = {type: 'NumericLiteral', value} // 初始化变量，这里假定为数字类型
      console.log(value)
      this.handler(blockCtx, left)
      const res = this.handler(blockCtx, body)
      if (res instanceof this.Returned) return res // 返回为Returned表示内部已经return
      if (res instanceof this.Broken) { // break直接跳出，若没有label，跳出当前循环即可，若有label且上级作用域不包含label，则继续上抛Broken标记类
        return (res.label === undefined || ctx['_labels']?.has(res.label)) ? undefined : res
      }
      if (res instanceof this.Continued) {
        if (res.label === undefined || ctx['_labels']?.has(res.label)) continue // 没有label或上级作用域包含返回的label，进入当前循环的下一轮循环
        return res // 该label需要上抛给上面的语句判断到哪里停止
      }
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
    for (let i = 0; i < node.elements.length; i++) {
      const element = node.elements[i]
      if (element === null) delete elements[elements.push(null) - 1]// 缺省元素 [1,,3]
      else if (element.type !== 'SpreadElement') elements.push(this.handler(ctx, element)) // 正常情况
      else elements.push(...this.handler(ctx, element.argument)) // 展开运算符
    }
    return elements
  }

  ThrowStatement(ctx, node) {
    throw this.handler(ctx, node.argument)
  }

  LabeledStatement(ctx, node) {
    const labels = ctx['_labels'] || new Set()
    labels.add(node.label.name)
    ctx['_labels'] = labels
    return this.handler(ctx, node.body)
  }

  ContinueStatement(ctx, node) {
    return new this.Continued(node.label?.name)
  }

  BreakStatement(ctx, node) {
    return new this.Broken(node.label?.name)
  }

  IfStatement(ctx, node) {
    if (this.handler(ctx, node.test)) {
      return this.handler(ctx, node.consequent)
    } else if (node.alternate !== null) {
      return this.handler(ctx, node.alternate)
    }
  }
  EmptyStatement() {}
}

const vm = new JSVM()
vm.handler(vm.context, ast)

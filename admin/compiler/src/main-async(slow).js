/*支持async语法*/
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
    const context = Object.create(null)
    context['_parent'] = null
    context['this'] = global
    context['_async'] = 0
    context['_await'] = false
    this.context = context
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

  async handler1(ctx, node) {
    if (arguments.length !== 2) throw Error('handler需要2个参数')
    if (typeof this[node.type + '1'] !== 'function') throw Error(`${node.type}1 不是函数`)
    return this[node.type + '1'](ctx, node)
  }

  handler0(ctx, node) { // 所有被handler直接调用的函数都包裹返回，不是直接调用的一般不包裹
    if (arguments.length !== 2) throw Error('handler需要2个参数')
    if (typeof this[node.type + '0'] !== 'function') throw Error(`${node.type}0 不是函数`)
    return this[node.type + '0'](ctx, node)
  }

  findIdentifierAndCtx(ctx, node) {
    const name = node.name
//    if (name === 'Promise') console.log(ctx, node)
    while (ctx && !(name in ctx)) ctx = ctx['_parent'] // 查找上级作用域
    ctx = ctx || this.global // 最后查全局作用域
    return [ctx, name]
    //    if (!ctx) {
//      if (name in this.global) return this.global[name] // 最后查全局作用域
//      throw Error(`找不到变量 ${name}`)
//    }
//    if (parent.type === 'AssignmentExpression') {
//      console.log(ctx, node, parent)
//      return ctx[name] = this.handler(ctx, node.right)
//    }
  }

  Identifier1(ctx, node) { // 变量
    const [_ctx, name] = this.findIdentifierAndCtx(ctx, node)
    return [_ctx[name]]
  }

  Identifier0 = this.Identifier1

  async CallExpression1(ctx, node) {
    const {callee, arguments: _args} = node
    const args = []
    for (const argument of _args) args.push((await this.handler1(ctx, argument))[0])
    if (callee.type !== 'MemberExpression') {
      const caller = (await this.handler1(ctx, callee))[0]
      return [caller(...args)] // this指向
    }
    return [(await this.handler1(ctx, callee.object))[0][callee.property.name](...args)] // this指向
  }

  CallExpression0(ctx, node) {
    const {callee, arguments: _args} = node
    const args = []
    for (const argument of _args) args.push(this.handler0(ctx, argument)[0])
    if (callee.type !== 'MemberExpression') {
      const caller = this.handler0(ctx, callee)[0]
      return [caller(...args)] // this指向
    }
    return [this.handler0(ctx, callee.object)[0][callee.property.name](...args)] // this指向
  }

  // 处理成员表达式
  _memberExpressionHandler = {
    async undefined1(vm, ctx, node, key) {
      return (await vm.handler1(ctx, node.object))[0][key]
    },
    undefined0(vm, ctx, node, key) { // 取值模式（默认）
      return vm.handler0(ctx, node.object)[0][key]
    },
    async delete1(vm, ctx, node, key) { // 删除模式
      return delete (await vm.handler1(ctx, node.object))[0][key]
    },
    delete0(vm, ctx, node, key) {
      return delete vm.handler0(ctx, node.object)[0][key]
    },
    async assign1(vm, ctx, node, key) { // 赋值模式
      const o = (await vm.handler1(ctx, node.object))[0]
      return o[key] = vm.assignmentExpressionMap[node.operator](o[key], node.value)
    },
    assign0(vm, ctx, node, key) {
      const o = vm.handler0(ctx, node.object)[0]
      return o[key] = vm.assignmentExpressionMap[node.operator](o[key], node.value)
    },
    async update1(vm, ctx, node, key) { // 更新：++, --
      const {object, updateInfo: {prefix, operator}} = node
      const o = (await vm.handler1(ctx, object))[0]
      return vm.updateExpressionMap[operator + prefix](o, key)
    },
    update0(vm, ctx, node, key) { // 更新：++, --
      const {object, updateInfo: {prefix, operator}} = node
      const o = vm.handler0(ctx, object)[0]
      return vm.updateExpressionMap[operator + prefix](o, key)
    }
  }

  async MemberExpression1(ctx, node) {
    const {property, kind} = node
    const key = !node.computed ? property.name : (await this.handler1(ctx, property))[0]
    return [await this._memberExpressionHandler[kind + '1'](this, ctx, node, key)] // kind为自定义字段
  }

  MemberExpression0(ctx, node) {
    const {property, kind} = node
    const key = !node.computed ? property.name : this.handler0(ctx, property)[0]
    return [this._memberExpressionHandler[kind + '0'](this, ctx, node, key)] // kind为自定义字段
  }

  _assignmentExpressionHandler = {
    async handler1(vm, ctx, left, right, operatorOrRestArgs, assign) { // 公共方法
      if (arguments.length !== 6) throw Error('参数错误') // todo
      return this[left.type + '1'](vm, ctx, left, right, operatorOrRestArgs, assign)
    },
    handler0(vm, ctx, left, right, operatorOrRestArgs, assign) { // 公共方法
      if (arguments.length !== 6) throw Error('参数错误') // todo
      return this[left.type + '0'](vm, ctx, left, right, operatorOrRestArgs, assign)
    },
    Identifier1(vm, ctx, left, right, operator) {
      const [_ctx, name] = vm.findIdentifierAndCtx(ctx, left) // 可能是上级作用域的变量
      return _ctx[name] = vm.assignmentExpressionMap[operator](_ctx[name], right)
    },
    Identifier0(vm, ctx, left, right, operator) {
      const [_ctx, name] = vm.findIdentifierAndCtx(ctx, left) // 可能是上级作用域的变量
      return _ctx[name] = vm.assignmentExpressionMap[operator](_ctx[name], right)
    },
    async MemberExpression1(vm, ctx, left, right, operator) {
      left['kind'] = 'assign'
      left['value'] = right
      left['operator'] = operator
      return (await vm.MemberExpression1(ctx, left))[0]
    },
    MemberExpression0(vm, ctx, left, right, operator) {
      left['kind'] = 'assign'
      left['value'] = right
      left['operator'] = operator
      return vm.MemberExpression0(ctx, left)[0]
    },
    async ObjectPattern1(vm, ctx, left, right, operatorOrRestArgs, assign) { // 公共方法
      const usedKeys = new Set() // 新的对象，重新记录解构的key
      for (let i = 0; i < left.properties.length; i++) {
        const property = left.properties[i]
        if (property.type === 'ObjectProperty') {
          const key = await vm.getObjectKey1(ctx, property)
          usedKeys.add(key)
          assign ?
            await this.handler1(vm, ctx, property.value, right[key], operatorOrRestArgs, false) // 上一步已赋参数默认值，此时不再赋值，变量交给Identifier赋值
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
    ObjectPattern0(vm, ctx, left, right, operatorOrRestArgs, assign) { // 公共方法
      const usedKeys = new Set() // 新的对象，重新记录解构的key
      for (let i = 0; i < left.properties.length; i++) {
        const property = left.properties[i]
        if (property.type === 'ObjectProperty') {
          const key = vm.getObjectKey0(ctx, property)
          usedKeys.add(key)
          assign ?
            this.handler0(vm, ctx, property.value, right[key], operatorOrRestArgs, false) // 上一步已赋参数默认值，此时不再赋值，变量交给Identifier赋值
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
    async ArrayPattern1(vm, ctx, left, right, operatorOrRestArgs) { // 公共方法
      for (let i = 0; i < left.elements.length; i++) {
        const element = left.elements[i]
        if (element === null) continue
        if (element.type !== 'RestElement') await this.handler1(vm, ctx, element, right[i], operatorOrRestArgs, false)
        else await this.handler1(vm, ctx, element.argument, [...right.slice(i)], operatorOrRestArgs, false) // 剩余元素
      }
      return right
    },
    ArrayPattern0(vm, ctx, left, right, operatorOrRestArgs) { // 公共方法
      for (let i = 0; i < left.elements.length; i++) {
        const element = left.elements[i]
        if (element === null) continue
        if (element.type !== 'RestElement') this.handler0(vm, ctx, element, right[i], operatorOrRestArgs, false)
        else this.handler0(vm, ctx, element.argument, [...right.slice(i)], operatorOrRestArgs, false) // 剩余元素
      }
      return right
    },
    async AssignmentPattern1(vm, ctx, _left, _right, operatorOrRestArgs) { // 公共方法
      const {left, right} = _left
      if (_right === undefined) _right = (await vm.handler1(ctx, right))[0] // 参数默认值
      return this.handler1(vm, ctx, left, _right, operatorOrRestArgs, true)
    },
    AssignmentPattern0(vm, ctx, _left, _right, operatorOrRestArgs) { // 公共方法
      const {left, right} = _left
      if (_right === undefined) _right = vm.handler0(ctx, right)[0] // 参数默认值
      return this.handler0(vm, ctx, left, _right, operatorOrRestArgs, true)
    }
  }

  async AssignmentExpression1(ctx, node) {
    const {left, operator, right} = node
    return [await this._assignmentExpressionHandler.handler1(this, ctx, left, (await this.handler1(ctx, right))[0], operator, true)]
  }

  AssignmentExpression0(ctx, node) {
    const {left, operator, right} = node
    return [this._assignmentExpressionHandler.handler0(this, ctx, left, this.handler0(ctx, right)[0], operator, true)]
  }

  async ExpressionStatement1(ctx, node) {
    return this.handler1(ctx, node.expression)
  }

  ExpressionStatement0(ctx, node) {
    return this.handler0(ctx, node.expression)
  }

  async File1(ctx, node) {
    return this.handler1(ctx, node.program)
  }

  File0(ctx, node) {
    return this.handler0(ctx, node.program)
  }

  _variableDeclarationHandler = {
    handler1: this._assignmentExpressionHandler.handler1,
    handler0: this._assignmentExpressionHandler.handler0,
    Identifier1(vm, ctx, id, init) {
      return ctx[id.name] = init
    },
    Identifier0(vm, ctx, id, init) {
      return ctx[id.name] = init
    },
    ObjectPattern1: this._assignmentExpressionHandler.ObjectPattern1,
    ObjectPattern0: this._assignmentExpressionHandler.ObjectPattern0,
    ArrayPattern1: this._assignmentExpressionHandler.ArrayPattern1,
    ArrayPattern0: this._assignmentExpressionHandler.ArrayPattern0,
    AssignmentPattern1: this._assignmentExpressionHandler.AssignmentPattern1,
    AssignmentPattern0: this._assignmentExpressionHandler.AssignmentPattern0,
  }

  async VariableDeclaration1(ctx, node) {
    for (let i = 0; i < node.declarations.length; i++) {
      let {id, init} = node.declarations[i]
      if (init !== null) init['fnName'] = id.name // 将变量名作为赋值对象的函数名（如果init是函数），如：const a = function () {}
      await this._variableDeclarationHandler.handler1(this, ctx, id, init !== null ? (await this.handler1(ctx, init))[0] : undefined, null, true)
    }
    return [undefined]
  }

  VariableDeclaration0(ctx, node) {
    for (let i = 0; i < node.declarations.length; i++) {
      let {id, init} = node.declarations[i]
      if (init !== null) init['fnName'] = id.name // 将变量名作为赋值对象的函数名（如果init是函数），如：const a = function () {}
      this._variableDeclarationHandler.handler0(this, ctx, id, init !== null ? this.handler0(ctx, init)[0] : undefined, null, true)
    }
    return [undefined]
  }

  async LogicalExpression1(ctx, node) {
    const {left, operator, right} = node
    return this.logicalExpressionMap[operator]((await this.handler1(ctx, left))[0], (await this.handler1(ctx, right))[0])
  }

  LogicalExpression0(ctx, node) {
    const {left, operator, right} = node
    return this.logicalExpressionMap[operator](this.handler0(ctx, left)[0], this.handler0(ctx, right)[0])
  }

  async BinaryExpression1(ctx, node) {
    const {left, operator, right} = node
    return [this.binaryExpressionMap[operator]((await this.handler1(ctx, left))[0], (await this.handler1(ctx, right))[0])]
  }

  BinaryExpression0(ctx, node) {
    const {left, operator, right} = node
    return [this.binaryExpressionMap[operator](this.handler0(ctx, left)[0], this.handler0(ctx, right)[0])]
  }

  async UnaryExpression1(ctx, node) {
    const {operator, argument} = node
    return this.unaryExpressionMap[operator]((await this.handler1(ctx, argument))[0], ctx, argument)
  }

  UnaryExpression0(ctx, node) {
    const {operator, argument} = node
    return this.unaryExpressionMap[operator](this.handler0(ctx, argument)[0], ctx, argument)
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

  async UpdateExpression1(ctx, node) { // todo
    const {operator, prefix, argument} = node
    if (argument.type === 'Identifier') { // 可能是上级作用域的变量
      const [_ctx, name] = this.findIdentifierAndCtx(ctx, argument)
      return this.updateExpressionMap[operator + prefix](_ctx, name)
    }
    argument['kind'] = 'update' // 目前认为是成员表达式：MemberExpression
    argument['updateInfo'] = {prefix, operator}
    return await this.MemberExpression1(ctx, argument)
//    return this._updateExpressionHandler[argument.type](this, ctx, argument, prefix, operator)
  }

  UpdateExpression0(ctx, node) { // todo
    const {operator, prefix, argument} = node
    if (argument.type === 'Identifier') { // 可能是上级作用域的变量
      const [_ctx, name] = this.findIdentifierAndCtx(ctx, argument)
      return this.updateExpressionMap[operator + prefix](_ctx, name)
    }
    argument['kind'] = 'update' // 目前认为是成员表达式：MemberExpression
    argument['updateInfo'] = {prefix, operator}
    return this.MemberExpression0(ctx, argument)
//    return this._updateExpressionHandler[argument.type](this, ctx, argument, prefix, operator)
  }

  NumericLiteral1(ctx, node) {
    return [node.value]
  }

  NumericLiteral0 = this.NumericLiteral1

  async ReturnStatement1(ctx, node) {
    return [new this.Returned(node.argument ? (await this.handler1(ctx, node.argument))[0] : undefined)]
  }

  ReturnStatement0(ctx, node) {
    return [new this.Returned(node.argument ? this.handler0(ctx, node.argument)[0] : undefined)]
  }

  StringLiteral1(ctx, node) {
    return [node.value]
  }

  StringLiteral0 = this.StringLiteral1

  async Program1(ctx, node) {
    for (let i = 0, l = node.body.length; i < l; i++) {
      await this.handler1(ctx, node.body[i])
    }
  }

  Program0(ctx, node) {
    for (let i = 0, l = node.body.length; i < l; i++) {
      this.handler0(ctx, node.body[i])
    }
  }

  async AwaitExpression1(ctx, node) {
    ctx['_await'] = true
    return [await (await this.handler1(ctx, node.argument))[0]] // 2次await
  }

  AwaitExpression0 = this.ArrayExpression1

  // 处理形参
  formalParamsHandler(ctx, params, args) {
    const l = params.length
    const restArgs = args.slice(l - 1)
    for (let i = 0; i < l; i++) {
      this._formalParamsHandler.handler0(this, ctx, params[i], args[i], restArgs, false)
    }
  }

  async getObjectKey1(ctx, node) {
    // computed 是否需计算
    return !node.computed ? node.key.name : (await this.handler1(ctx, node.key))[0]
  }

  getObjectKey0(ctx, node) {
    // computed 是否需计算
    return !node.computed ? node.key.name : this.handler0(ctx, node.key)[0]
  }

  _formalParamsHandler = { // 形参没有异步
    handler1: this._assignmentExpressionHandler.handler1,
    handler0: this._assignmentExpressionHandler.handler0,
    /* handler(vm, ctx, node, argument, restArgs, assign) {
      if (arguments.length !== 6) throw Error('参数错误') // todo
      this[node.type](vm, ctx, node, argument, restArgs, assign)
    }, */
    Identifier1(vm, ctx, node, argument) {
      return ctx[node.name] = argument
    },
    Identifier0(vm, ctx, node, argument) {
      return ctx[node.name] = argument
    },
    ObjectPattern1: this._assignmentExpressionHandler.ObjectPattern1,
    ObjectPattern0: this._assignmentExpressionHandler.ObjectPattern0,
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
    ArrayPattern1: this._assignmentExpressionHandler.ArrayPattern1,
    ArrayPattern0: this._assignmentExpressionHandler.ArrayPattern0,
    /* ArrayPattern(vm, ctx, node, argument, restArgs) {
      for (let i = 0; i < node.elements.length; i++) {
        const element = node.elements[i]
        if (element.type !== 'RestElement') this.handler(vm, ctx, element, argument[i], restArgs, false)
        else this.handler(vm, ctx, element.argument, argument.slice(i), restArgs, false) // 剩余元素
      }
    }, */
    AssignmentPattern1: this._assignmentExpressionHandler.AssignmentPattern1,
    AssignmentPattern0: this._assignmentExpressionHandler.AssignmentPattern0,
    /* AssignmentPattern(vm, ctx, node, argument, restArgs) {
      const {left, right} = node
      if (argument === undefined) argument = vm.handler(ctx, right) // 参数默认值
      this.handler(vm, ctx, left, argument, restArgs, true)
    }, */
    RestElement1(vm, ctx, node, argument, restArgs) { // 剩余参数
      ctx[node.argument.name] = restArgs
    },
    RestElement0(vm, ctx, node, argument, restArgs) { // 剩余参数
      ctx[node.argument.name] = restArgs
    },
  }

  async FunctionDeclaration1(ctx, node) {
    return [ctx[node.id.name] = (await this.FunctionExpression1(ctx, node))[0]]
  }

  FunctionDeclaration0(ctx, node) {
    return [ctx[node.id.name] = this.FunctionExpression0(ctx, node)[0]]
  }

  async FunctionExpression1(ctx, node) {
    const _this = this
    const generateFnBody1 = async function (args, context) {
      const blockCtx = Object.create(null, {'_parent': {value: ctx}, 'this': {value: context}, 'arguments': {value: args}, '_async': {value: 1}})
      _this.formalParamsHandler(blockCtx, node.params, Array.from(args))
      node.body['function'] = true
      //      const res = _this.handler(blockCtx, node.body)
//      return res instanceof _this.Returned ? res.data : res
      return (await _this.handler1(blockCtx, node.body))[0]?.data // 若有return，则必有data，若没有return，则返回为undefined todo
    }
    const generateFnBody0 = function (args, context) {
      const blockCtx = Object.create(null, {'_parent': {value: ctx}, 'this': {value: context}, 'arguments': {value: args}, '_async': {value: 0}})
      _this.formalParamsHandler(blockCtx, node.params, Array.from(args))
      node.body['function'] = true
      //      const res = _this.handler(blockCtx, node.body)
//      return res instanceof _this.Returned ? res.data : res
      return _this.handler0(blockCtx, node.body)[0]?.data // 若有return，则必有data，若没有return，则返回为undefined todo
    }
    const name = node.id?.name ?? node['fnName']
    if (!node.async) {
      if (name === undefined) return [function () { // 匿名函数
        return generateFnBody0(arguments, this)
      }]
      const o = {
        [name]: function () { // 保留定义时的函数名
          return generateFnBody0(arguments, this)
        }
      }
      return [o[name]]
      /* return function () { // 使用js的属性点方式绑定this
        return generateFnBody(arguments, this)
      } */
    } else {
      if (name === undefined) return [async function () { // 匿名函数
        return await generateFnBody1(arguments, this)
      }]
      const o = {
        [name]: async function () {
          return await generateFnBody1(arguments, this)
        }
      }
      return [o[name]]
      /* return async function () {
        return generateFnBody(arguments, this)
      } */
    }
  }

  FunctionExpression0(ctx, node) {
    const _this = this
    const generateFnBody1 = async function (args, context) {
      const blockCtx = Object.create(null, {'_parent': {value: ctx}, 'this': {value: context}, 'arguments': {value: args}, '_async': {value: 1}})
      _this.formalParamsHandler(blockCtx, node.params, Array.from(args))
      node.body['function'] = true
      //      const res = _this.handler(blockCtx, node.body)
//      return res instanceof _this.Returned ? res.data : res
      return (await _this.handler1(blockCtx, node.body))[0]?.data // 若有return，则必有data，若没有return，则返回为undefined todo
    }
    const generateFnBody0 = function (args, context) {
      const blockCtx = Object.create(null, {'_parent': {value: ctx}, 'this': {value: context}, 'arguments': {value: args}, '_async': {value: 0}})
      _this.formalParamsHandler(blockCtx, node.params, Array.from(args))
      node.body['function'] = true
      //      const res = _this.handler(blockCtx, node.body)
//      return res instanceof _this.Returned ? res.data : res
      return _this.handler0(blockCtx, node.body)[0]?.data // 若有return，则必有data，若没有return，则返回为undefined todo
    }
    const name = node.id?.name ?? node['fnName']
    if (!node.async) {
      if (name === undefined) return [function () { // 匿名函数
        return generateFnBody0(arguments, this)
      }]
      const o = {
        [name]: function () { // 保留定义时的函数名
          return generateFnBody0(arguments, this)
        }
      }
      return [o[name]]
      /* return function () { // 使用js的属性点方式绑定this
        return generateFnBody(arguments, this)
      } */
    } else {
      if (name === undefined) return [async function () { // 匿名函数
        return generateFnBody1(arguments, this)
      }]
      const o = {
        [name]: async function () {
          return generateFnBody1(arguments, this)
        }
      }
      return [o[name]]
      /* return async function () {
        return generateFnBody(arguments, this)
      } */
    }
  }

  async ArrowFunctionExpression1(ctx, node) {
    const blockCtx = Object.create(null, {'_parent': {value: ctx}})
    node.body['function'] = true
    const name = node['fnName']
    const generateFnBody = async function (_this, args) {
      _this.formalParamsHandler(blockCtx, node.params, args)
      //      const res = _this.handler(blockCtx, node.body)
//      return res instanceof _this.Returned ? res.data : res
      return ((await _this.handler1(blockCtx, node.body))[0])?.data // 若有return，则必有data，若没有return，则返回为undefined todo
    }
    if (!node.async) {
      if (name === undefined) return [(...args) => generateFnBody(this, args)]
      const o = { // 保留函数名
        [name]: (...args) => generateFnBody(this, args)
      }
      return [o[name]]
    } else {
      if (name === undefined) return [async (...args) => generateFnBody(this, args)]
      const o = { // 保留函数名
        [name]: async (...args) => generateFnBody(this, args)
      }
      return [o[name]]
    }
  }

  ArrowFunctionExpression0(ctx, node) {
    const blockCtx = Object.create(null, {'_parent': {value: ctx}})
    node.body['function'] = true
    const name = node['fnName']
    const generateFnBody = function (_this, args) {
      _this.formalParamsHandler(blockCtx, node.params, args)
//      const res = _this.handler(blockCtx, node.body)
//      return res instanceof _this.Returned ? res.data : res
      return (_this.handler0(blockCtx, node.body)[0])?.data // 若有return，则必有data，若没有return，则返回为undefined todo
    }
    if (!node.async) {
      if (name === undefined) return [(...args) => generateFnBody(this, args)]
      const o = { // 保留函数名
        [name]: (...args) => generateFnBody(this, args)
      }
      return [o[name]]
    } else {
      if (name === undefined) return [async (...args) => generateFnBody(this, args)]
      const o = { // 保留函数名
        [name]: async (...args) => generateFnBody(this, args)
      }
      return [o[name]]
    }
  }

  async NewExpression1(ctx, node) {
    const callee = (await this.handler1(ctx, node.callee))[0]
    const args = []
    for (const argument of node.arguments) args.push((await this.handler1(ctx, argument))[0])
    return [new callee(...args)]
  }

  NewExpression0(ctx, node) {
    const callee = this.handler0(ctx, node.callee)[0]
    const args = []
    for (const argument of node.arguments) args.push(this.handler0(ctx, argument)[0])
    return [new callee(...args)]
  }

  // 处理不同的函数类型kind type: ObjectMethod
  _kindMethodHandler = {
    async handler1(vm, ctx, node, o, key) {
      await this[node.kind + '1'](vm, ctx, node, o, key)
    },
    handler0(vm, ctx, node, o, key) {
      this[node.kind + '0'](vm, ctx, node, o, key)
    },
    getDescriptor(o, key) {
      return Object.getOwnPropertyDescriptor(o, key) || {
        configurable: true,
        enumerable: true,
      }
    },
    async method1(vm, ctx, node, o, key) {
      node['fnName'] = key
      o[key] = (await vm.FunctionExpression1(ctx, node))[0]
    },
    method0(vm, ctx, node, o, key) {
      node['fnName'] = key
      o[key] = vm.FunctionExpression0(ctx, node)[0]
    },
    async get1(vm, ctx, node, o, key) {
      const descriptor = this.getDescriptor(o, key)
      node['fnName'] = key
      descriptor.get = (await vm.FunctionExpression1(ctx, node))[0]
      Object.defineProperty(o, key, descriptor)
    },
    get0(vm, ctx, node, o, key) {
      const descriptor = this.getDescriptor(o, key)
      node['fnName'] = key
      descriptor.get = vm.FunctionExpression0(ctx, node)[0]
      Object.defineProperty(o, key, descriptor)
    },
    async set1(vm, ctx, node, o, key) {
      const descriptor = this.getDescriptor(o, key)
      node['fnName'] = key
      descriptor.set = (await vm.FunctionExpression1(ctx, node))[0]
      Object.defineProperty(o, key, descriptor)
    },
    set0(vm, ctx, node, o, key) {
      const descriptor = this.getDescriptor(o, key)
      node['fnName'] = key
      descriptor.set = vm.FunctionExpression0(ctx, node)[0]
      Object.defineProperty(o, key, descriptor)
    },
  }
  // 处理对象表达式 type: ObjectExpression
  _objectExpressionHandler = {
    async handler1(vm, ctx, o, node) {
      return await this[node.type + '1'](vm, ctx, o, node)
    },
    handler0(vm, ctx, o, node) {
      return this[node.type + '0'](vm, ctx, o, node)
    },
    async ObjectProperty1(vm, ctx, o, node) { // 属性
      const key = await vm.getObjectKey1(ctx, node)
      node.value['fnName'] = key
      o[key] = (await vm.handler1(ctx, node.value))[0]
      return o
    },
    ObjectProperty0(vm, ctx, o, node) { // 属性
      const key = vm.getObjectKey0(ctx, node)
      node.value['fnName'] = key
      o[key] = vm.handler0(ctx, node.value)[0]
      return o
    },
    async ObjectMethod1(vm, ctx, o, node) { // 方法
      await vm._kindMethodHandler.handler1(vm, ctx, node, o, (await vm.getObjectKey1(ctx, node))[0])
      return o
    },
    ObjectMethod0(vm, ctx, o, node) { // 方法
      vm._kindMethodHandler.handler0(vm, ctx, node, o, vm.getObjectKey0(ctx, node)[0])
      return o
    },
    async SpreadElement1(vm, ctx, o, node) { // 展开运算符
      return Object.assign(o, (await vm.handler1(ctx, node.argument))[0])
    },
    SpreadElement0(vm, ctx, o, node) { // 展开运算符
      return Object.assign(o, vm.handler0(ctx, node.argument)[0])
    }
  }

  async ObjectExpression1(ctx, node) {
    const o = {}
    for (const property of node.properties) await this._objectExpressionHandler.handler1(this, ctx, o, property)
    return [o]
  }

  ObjectExpression0(ctx, node) {
    const o = {}
    for (const property of node.properties) this._objectExpressionHandler.handler0(this, ctx, o, property)
    return [o]
  }

  ThisExpression1(ctx) {
    while (ctx && !('this' in ctx)) ctx = ctx['_parent']
    return [ctx?.this]
  }

  ThisExpression0 = this.ThisExpression1
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
  async BlockStatement1(ctx, node) {
    const blockCtx = node['function'] || node['for'] ? ctx : Object.create(null, {'_parent': {value: ctx}}) // 如果不是函数声明或for语句里的，添加块级作用域
    for (let i = 0, l = node.body.length; i < l; i++) {
      const body = node.body[i]
      if (body.type !== 'ReturnStatement') {
        const res = (await this.handler1(blockCtx, body))[0]
        if (res instanceof this.Returned || res instanceof this.Broken) return [res] // 返回为Returned表示内部已经return || 结束当前代码块。直接上抛标记类，终止上方的循环
        if (res instanceof this.Continued) return res.label === undefined ? [undefined] : [res] // 结束当前代码块。若没有label，跳出当前循环即可；若有label，则继续上抛标记类
      } else return this.ReturnStatement1(blockCtx, body)
    }
    return [undefined]
  }

  BlockStatement0(ctx, node) {
    const blockCtx = node['function'] || node['for'] ? ctx : Object.create(null, {'_parent': {value: ctx}}) // 如果不是函数声明或for语句里的，添加块级作用域
    for (let i = 0, l = node.body.length; i < l; i++) {
      const body = node.body[i]
      if (body.type !== 'ReturnStatement') {
        const res = this.handler0(blockCtx, body)[0]
        if (res instanceof this.Returned || res instanceof this.Broken) return [res] // 返回为Returned表示内部已经return || 结束当前代码块。直接上抛标记类，终止上方的循环
        if (res instanceof this.Continued) return res.label === undefined ? [undefined] : [res] // 结束当前代码块。若没有label，跳出当前循环即可；若有label，则继续上抛标记类
      } else return this.ReturnStatement0(blockCtx, body)
    }
    return [undefined]
  }

  async ForStatement1(ctx, node) {
    const blockCtx = Object.create(null, {'_parent': {value: ctx}})
    const {init, test, update, body} = node
    body['for'] = true
    for (await this.handler1(blockCtx, init); (await this.handler1(blockCtx, test))[0]; await this.handler1(blockCtx, update)) {
      const res = (await this.handler1(blockCtx, body))[0]
      if (res instanceof this.Returned) return [res] // 返回为Returned表示内部已经return
      if (res instanceof this.Broken) { // break直接跳出，若没有label，跳出当前循环即可，若有label且上级作用域不包含label，则继续上抛Broken标记类
        return (res.label === undefined || ctx['_labels']?.has(res.label)) ? [undefined] : [res]
      }
      if (res instanceof this.Continued) {
        if (res.label === undefined || ctx['_labels']?.has(res.label)) continue // 没有label或上级作用域包含返回的label，进入当前循环的下一轮循环
        return [res] // 该label需要上抛给上面的语句判断到哪里停止
      }
    }
    return [undefined]
  }

  ForStatement0(ctx, node) {
    const blockCtx = Object.create(null, {'_parent': {value: ctx}})
    const {init, test, update, body} = node
    body['for'] = true
    for (this.handler0(blockCtx, init); this.handler0(blockCtx, test)[0]; this.handler0(blockCtx, update)) {
      const res = this.handler0(blockCtx, body)[0]
      if (res instanceof this.Returned) return [res] // 返回为Returned表示内部已经return
      if (res instanceof this.Broken) { // break直接跳出，若没有label，跳出当前循环即可，若有label且上级作用域不包含label，则继续上抛Broken标记类
        return (res.label === undefined || ctx['_labels']?.has(res.label)) ? [undefined] : [res]
      }
      if (res instanceof this.Continued) {
        if (res.label === undefined || ctx['_labels']?.has(res.label)) continue // 没有label或上级作用域包含返回的label，进入当前循环的下一轮循环
        return [res] // 该label需要上抛给上面的语句判断到哪里停止
      }
    }
    return [undefined]
  }

  async ForOfStatement1(ctx, node) {
    const blockCtx = Object.create(null, {'_parent': {value: ctx}})
    const {left, right, body} = node
    body['for'] = true
    for (const value of (await this.handler1(ctx, right))[0]) {
      left.init = {type: 'NumericLiteral', value} // 初始化变量，这里假定为数字类型
      await this.handler1(blockCtx, left)
      const res = (await this.handler1(blockCtx, body))[0]
      if (res instanceof this.Returned) return [res] // 返回为Returned表示内部已经return
      if (res instanceof this.Broken) { // break直接跳出，若没有label，跳出当前循环即可，若有label且上级作用域不包含label，则继续上抛Broken标记类
        return (res.label === undefined || ctx['_labels']?.has(res.label)) ? [undefined] : [res]
      }
      if (res instanceof this.Continued) {
        if (res.label === undefined || ctx['_labels']?.has(res.label)) continue // 没有label或上级作用域包含返回的label，进入当前循环的下一轮循环
        return [res] // 该label需要上抛给上面的语句判断到哪里停止
      }
    }
    return [undefined]
  }

  ForOfStatement0(ctx, node) {
    const blockCtx = Object.create(null, {'_parent': {value: ctx}})
    const {left, right, body} = node
    body['for'] = true
    for (const value of this.handler0(ctx, right)[0]) {
      left.init = {type: 'NumericLiteral', value} // 初始化变量，这里假定为数字类型
      this.handler0(blockCtx, left)
      const res = this.handler0(blockCtx, body)[0]
      if (res instanceof this.Returned) return [res] // 返回为Returned表示内部已经return
      if (res instanceof this.Broken) { // break直接跳出，若没有label，跳出当前循环即可，若有label且上级作用域不包含label，则继续上抛Broken标记类
        return (res.label === undefined || ctx['_labels']?.has(res.label)) ? [undefined] : [res]
      }
      if (res instanceof this.Continued) {
        if (res.label === undefined || ctx['_labels']?.has(res.label)) continue // 没有label或上级作用域包含返回的label，进入当前循环的下一轮循环
        return [res] // 该label需要上抛给上面的语句判断到哪里停止
      }
    }
    return [undefined]
  }

  BooleanLiteral1(ctx, node) {
    return [node.value]
  }

  BooleanLiteral0 = this.BooleanLiteral1

  NullLiteral1() {
    return [null]
  }

  NullLiteral0 = this.NullLiteral1

  async ArrayExpression1(ctx, node) {
    const elements = []
    for (let i = 0; i < node.elements.length; i++) {
      const element = node.elements[i]
      if (element === null) delete elements[elements.push(null) - 1]// 缺省元素 [1,,3]
      else if (element.type !== 'SpreadElement') elements.push((await this.handler1(ctx, element))[0]) // 正常情况
      else elements.push(...(await this.handler1(ctx, element.argument))[0]) // 展开运算符
    }
    return [elements]
  }

  ArrayExpression0(ctx, node) {
    const elements = []
    for (let i = 0; i < node.elements.length; i++) {
      const element = node.elements[i]
      if (element === null) delete elements[elements.push(null) - 1]// 缺省元素 [1,,3]
      else if (element.type !== 'SpreadElement') elements.push(this.handler0(ctx, element)[0]) // 正常情况
      else elements.push(...this.handler0(ctx, element.argument)[0]) // 展开运算符
    }
    return [elements]
  }

  async TemplateLiteral1(ctx, node) {
    const {quasis, expressions} = node
    let i = 0
    let temElement = quasis[i]
    let res = temElement.value.raw
    while (!temElement.tail) {
      res += temElement.value.raw + String((await this.handler1(ctx, expressions[i]))[0])
      temElement = quasis[++i]
    }
    return [res + temElement.value.raw]
  }

  TemplateLiteral0(ctx, node) {
    const {quasis, expressions} = node
    let i = 0
    let temElement = quasis[i]
    let res = ''
    while (!temElement.tail) {
      res += temElement.value.raw + String(this.handler0(ctx, expressions[i])[0])
      temElement = quasis[++i]
    }
    return [res + temElement.value.raw]
  }

  async ThrowStatement1(ctx, node) {
    throw await this.handler1(ctx, node.argument)
  }

  ThrowStatement0(ctx, node) {
    throw this.handler0(ctx, node.argument)
  }

  async LabeledStatement1(ctx, node) {
    const labels = ctx['_labels'] || new Set()
    labels.add(node.label.name)
    ctx['_labels'] = labels
    return await this.handler1(ctx, node.body)
  }

  LabeledStatement0(ctx, node) {
    const labels = ctx['_labels'] || new Set()
    labels.add(node.label.name)
    ctx['_labels'] = labels
    return this.handler0(ctx, node.body)
  }

  ContinueStatement1(ctx, node) {
    return [new this.Continued(node.label?.name)]
  }

  ContinueStatement0 = this.ContinueStatement1

  BreakStatement1(ctx, node) {
    return [new this.Broken(node.label?.name)]
  }

  BreakStatement0 = this.BreakStatement1

  async IfStatement1(ctx, node) {
    if (await this.handler1(ctx, node.test)) {
      return await this.handler1(ctx, node.consequent)
    } else if (node.alternate !== null) {
      return await this.handler1(ctx, node.alternate)
    }
  }

  IfStatement0(ctx, node) {
    if (this.handler0(ctx, node.test)[0]) {
      return this.handler0(ctx, node.consequent)
    } else if (node.alternate !== null) {
      return this.handler0(ctx, node.alternate)
    } else return [undefined]
  }

  async ConditionalExpression1(ctx, node) {
    const {test, alternate, consequent} = node
    return (await this.handler1(ctx, test))[0] ? (await this.handler1(ctx, consequent))[0] : (await this.handler1(ctx, alternate))[0]
  }

  ConditionalExpression0(ctx, node) {
    const {test, alternate, consequent} = node
    return [this.handler0(ctx, test)[0] ? this.handler0(ctx, consequent)[0] : this.handler0(ctx, alternate)[0]]
  }

  EmptyStatement1() {
  }

  EmptyStatement0 = this.EmptyStatement1

  BigIntLiteral1(ctx, node) {
    return [BigInt(node.value)]
  }

  BigIntLiteral0 = this.BigIntLiteral1
}

const vm = new JSVM()
vm.handler0(vm.context, ast)

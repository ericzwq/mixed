import {parse} from '@babel/core'
import {each} from '@/assets/utils'
import Test from '@/assets/test'

const ast = parse(Test.objectExpression)
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
    if (!ctx) {
      if (name in window) return window[name] // 最后查全局作用域
      throw Error(`找不到变量 ${name}`)
    }
    return ctx[name]
  }

  CallExpression(ctx, node) {
    const {callee, arguments: args} = node
    if (callee.type !== 'MemberExpression') return this.handler(ctx, callee, node)(...args.map(argument => this.handler(ctx, argument, node)))
    return this.handler(ctx, callee.object, node)[callee.property.name](...args.map(argument => this.handler(ctx, argument, node))) // this指向
  }

  MemberExpression(ctx, node) {
    return this.handler(ctx, node.object, node)[node.property.name]
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
      ctx[node.name] = argument
    },
    ObjectPattern(vm, ctx, node, argument, restArgs, assign) {
      if (assign) { // 上一步是否为赋值模式
        each(node.properties, property => this.handler(vm, ctx, property.value, argument[vm.getObjectKey(ctx, property)]), restArgs, false)
      } else {
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
        generateFnBody(arguments, this)
      }
    } else {
      return async function () {
        generateFnBody(arguments, this)
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

  // 处理不同的函数类型 type: ObjectMethod
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
      this[node.type](vm, ctx, o, node)
    },
    ObjectProperty(vm, ctx, o, node) {
      o[vm.getObjectKey(ctx, node)] = vm.handler(ctx, node.value, node)
      return o
    },
    ObjectMethod(vm, ctx, o, node) {
      const key = vm.getObjectKey(ctx, node)
      vm._kindMethodHandler.handler(vm, ctx, node, o, key)
      return o
    },
    SpreadElement(vm, ctx, o, node) { // 展开运算符
      return Object.assign(o, vm.handler(ctx, node.argument, node))
    }
  }

  ObjectExpression(ctx, node) {
    return node.properties.reduce((acc, cur) => {
//      return this._objectExpressionHandler.handler(this, ctx, acc, cur)
      if (cur.type !== 'SpreadElement') {
        acc[this.getObjectKey(ctx, cur)] = this.handler(ctx, cur.value, cur)
        return acc
      }
      return Object.assign(acc, this.handler(ctx, cur.argument, cur)) // 展开运算符
    }, {})
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

  IfStatement(node) {
    //判断条件的类型是否是二进制表达式
    if (node.test.type != 'BinaryExpression') {
      throw new Error('if conds only support binary expression')
    }
    // 解析二进制表达式作为条件
    let cond = this.binaryHandler(node.test)
    // 生成数字0
    let zero = llvm.ConstantFP.get(the_context, 0)
    // 如果cond不是bool类型的指，将它转换为bool类型的值
    let cond_v = builder.createFCmpONE(cond, zero, 'ifcond')
    // 创建then和else和ifcont代码块，实际就是代码块标签
    let then_bb = llvm.BasicBlock.create(the_context, 'then', the_function)
    let else_bb = llvm.BasicBlock.create(the_context, 'else', the_function)
    let phi_bb = llvm.BasicBlock.create(the_context, 'ifcont', the_function)
    // 创造条件判断
    // 如果cond_v是真就跳跃到then_bb代码块，否则跳跃到else_bb代码块
    builder.createCondBr(cond_v, then_bb, else_bb)
    // 设定往then_bb代码块写入内容
    builder.setInsertionPoint(then_bb)
    if (!node.consequent) {
      throw new Error('then not extist')
    }
    if (node.consequent.type != 'BlockStatement') {
      throw new Error('then body only support BlockStatement')
    }
    // 解析代码块
    let then_value_list = this.BlockStatement(node.consequent)
    // 如果代码块没内容就就跳跃到phi_bb代码块
    if (then_value_list.length == 0) {
      builder.createBr(phi_bb)
    }
    // 设定往else_bb代码块写入内容，和then_else差不多
    // 不同点：else允许没有
    builder.setInsertionPoint(else_bb)
    let else_value_list = []
    if (node.alternate) {
      if (node.alternate.type != 'BlockStatement') {
        throw new Error('else body only support BlockStatement')
      }
      else_value_list = this.BlockStatement(node.alternate)
    }
    if (else_value_list.length == 0) {
      builder.createBr(phi_bb)
    }
    // 因为无论是then或else如果不中断一定会往phi_bb代码块
    // 所以后续的代码直接在phi_bb里面写就好
    builder.setInsertionPoint(phi_bb)
  }
}

new JSVM().handler(global, ast, null)

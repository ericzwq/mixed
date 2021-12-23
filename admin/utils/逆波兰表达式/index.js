// 如果当前字符为变量或者为数字，则压栈，如果是运算符，则将栈顶两个元素弹出作相应运算，结果再入栈，最后当表达式扫描完后，栈里的就是结果。
function evalRPN(tokens) {
  const stack = [], map = new Map([
    ['+', (a, b) => a + b],
    ['-', (a, b) => b - a], // 后弹出的在前面
    ['*', (a, b) => a * b],
    ['/', (a, b) => (a = b / a) > 0 ? Math.floor(a) : Math.ceil(a)] // 后弹出的在前面
  ])
  for (let i = 0; i < tokens.length; i++) {
    if (!isNaN(tokens[i])) stack.push(tokens[i])
    else stack.push(map.get(tokens[i])(+stack.pop(), +stack.pop()))
  }
  return stack[0]
}

// console.log(evalRPN(["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"]))
// console.log(evalRPN(["4", "13", "5", "/", "+"]))
console.log(evalRPN(["4", "13", "5", "/", "+"]))

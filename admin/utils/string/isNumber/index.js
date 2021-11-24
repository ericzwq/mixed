/*
  数值（按顺序）可以分成以下几个部分：
  若干空格
  一个小数或者整数
  （可选）一个'e'或'E'，后面跟着一个整数
  若干空格

  小数（按顺序）可以分成以下几个部分：
  （可选）一个符号字符（'+' 或 '-'）
  下述格式之一：
  至少一位数字，后面跟着一个点 '.'
  至少一位数字，后面跟着一个点 '.' ，后面再跟着至少一位数字
  一个点 '.' ，后面跟着至少一位数字

  整数（按顺序）可以分成以下几个部分：
  （可选）一个符号字符（'+' 或 '-'）
  至少一位数字
*/

/* 所有状态：
  1.起始的空格
  2.符号位
  3.整数部分
  4.左侧有整数的小数点
  5.左侧无整数的小数点（根据前面的第二条额外规则，需要对左侧有无整数的两种小数点做区分）
  6.小数部分
  7.字符 e
  8.指数部分的符号位
  9.指数部分的整数部分
  10.末尾的空格
*/
let isNumber = function (s) {
  // ["+100", "5e2", "-123", "3.1416", "-1E-16", "0123"] true
  // ["12e", "1a3.14", "1.2.3", "+-5", "12e+5.4"] false
  let status = 'init', dotCount = 0, eCount = 0 // 初始，小数，指数
  s = s.trim()
  if (!s) return false
  for (let i = 0, l = s.length; i < l; i++) {
    let cur = s[i]
    if ('+-'.includes(cur)) {
      if (i !== 0 && !('eE'.includes(l[i - 1]))) return false
    } else if ('.' === cur) {
      if (dotCount === 0) {
        dotCount++
        if (status === 'pow') return false
        if (i === s.length - 1) { // 1.
          if (notNum(s[i - 1])) return false
        } else if (notNum(s[i + 1])) {
          if (!'eE'.includes(s[i + 1])) { // 非e
            return false
          } else {
            if (i + 2 >= s.length || notNum(s[i - 1])) return false // .后是e，点前必有数字
          }
          if ((!'eE'.includes(s[i + 1])) || i + 2 >= s.length) return false // 1.e9, .e
        } else {
          status = 'float'
          i++
        }
      } else return false
    } else if ('eE'.includes(cur)) {
      if (eCount === 0) {
        eCount++
        status = 'pow'
        if (i === 0 || i === s.length - 1) return false // e不能在开头也不能在结尾
        if ('+-'.includes(s[i + 1])) { // e后有+-
          if (!notNum(s[i + 2])) i += 2
          else return false
        } else if (!notNum(s[i + 1])) {
          if ((s[i - 1]) !== '.' && notNum(s[i - 1])) return false
          i++
        } else return false
      } else return false
    } else if (' ' === cur || notNum(cur)) return false // 中间无空格，无非以上分支字符外字符
  }
  return true

  function notNum(s) {
    if (!s) return true
    let n = s.charCodeAt()
    return n < 48 || n > 58
  }
}
console.log(isNumber('.e1'));
console.log(isNumber('.e'));
console.log(isNumber('..'));
console.log(isNumber('e.'));
console.log(isNumber('1e'));
console.log(isNumber('e9'));
console.log(isNumber('+e9'));
console.log(isNumber('6e6.5'));
console.log(isNumber('2e0'));
console.log(isNumber('1.e1'));
console.log(isNumber('0.e1'));

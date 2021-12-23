// 不超过21亿
function add(m, n) {
  let carry
  while ((carry = m & n)) {
    n = m ^ n
    m = carry << 1
  }
  // return (m ^ n) >>> 0 // 转无符号数
  return m ^ n
}

function minus(m, n) {
  return add(m, add(~n, 1))
}

//     11
//     11
//     11
//    110
// = 1001
function multiply(m, n) {
  let isMinus = (m < 0 && n > 0) || (m > 0 && n < 0), res = 0
  m = Math.abs(m)
  n = Math.abs(n)
  while (n) {
    if (n & 1) res = add(res, m)
    m = m << 1 >>> 0 // 1073741824 >> 1 === -2147483648
    n = n >> 1
  }
  return isMinus ? -res : res
}


function divide(m, n) { // C语言中的除，无小数
  let isMinus = (m < 0 && n > 0) || (m > 0 && n < 0), res = 0
  m = Math.abs(m)
  n = Math.abs(n)
  let cur = m, t = n
  while (cur >= n) {
    let pow = 1
    while (true) {
      if (n << 1 >>> 0 > cur || n << 1 === 0) break // 防溢出
      n = n << 1 >>> 0 // 1073741824 >> 1 === -2147483648
      pow = multiply(pow, 2)
    }
    res += pow
    cur -= n
    n = t
  }
  res = isMinus ? -res : res
  return res > 2147483647 ? 2147483647 : res
}

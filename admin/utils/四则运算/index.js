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
  let res = 0
  while (n) {
    if (n & 1) res = add(res, m)
    m = m << 1
    n = n >> 1
  }
  return res
}

function divide(m, n) { // C语言中的除，无小数
  let i = 1, res = 0
  while (m && m > n) {
    i = 1
    for (; i <= 32; i = add(i, 1)) {
      if ((m >> i) < n) break
    }
    i = minus(i, 1)
    res = add(res, 1 << i)
    m = minus(m, multiply(1 << i, n))
  }
  return res
}

function hanoi(n) { // 汉诺塔问题
  function process(n, sta, end, hel) { // 1->右，2->中，1->中，3->右，1->左，2->右，1->右
    if (n < 1) return // 1--n-1 zhong, n you, 1--n-1 you
    // process(1, sta, end, hel)
    // process(2, sta, hel, end)
    // process(1, end, hel, sta)
    // process(3, sta, end, hel)
    // process(1, hel, sta, end)
    // process(2, hel, end, sta)
    // process(1, sta, end, hel)
    process(n - 1, sta, hel, end)
    console.log(`从 ${sta} 移动 ${n} 到 ${end} `)
    process(n - 1, hel, end, sta)
  }

  process(n, '左', '右', '中')
}

// hanoi(4)

function childCollection(str) { // 字符串所有子集
  const res = [], len = str.length

  function process(include, start = 0, prefix = '') {
    if (start === len) {
      if (include) res.push(prefix)
      return
    }
    if (include) prefix += str[start]
    process(true, start + 1, prefix)
    process(false, start + 1, prefix)
  }

  process(true)
  process(false)
  return res
}

// console.log(childCollection('abcdefghijk'));

function fullAarray(str) { // 字符串全排列
  const res = [], len = str.length

  function process(start, prefix) {
    if (start === len) {
      return res.push(prefix)
    }
    prefix += str[start]
    process(start + 1, prefix)
  }

  process(0, '')
  return res
}

console.log(fullAarray('abc'))

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
    console.log(`从 ${sta} 移动 ${n} 到 ${end}`)
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
  const res = [], max = str.length - 1
  str = str.split('')

  function process(n, prefix) {
    if (n >= max) return res.push(prefix + str[n])
    process(n + 1, prefix + str[n])
    for (let i = n + 1; i <= max; i++) {
      swap(str, i, n)
      process(n + 1, prefix + str[n])
      swap(str, i, n)
    }
  }

  process(0, '')

  function swap(arr, i, j) {
    let t = arr[i]
    arr[i] = arr[j]
    arr[j] = t
  }

  return res
}

// console.log(fullAarray('abcdefghi'))

function queen(n) { // n皇后, 14左右，合理使用
  let record = [], count = 0,
    isValid = (x, y, record) => record.length ? record.every((col, row) => Math.abs(y - col) !== Math.abs(x - row) && col !== y && row !== x) : true

  function process(i, record) { // 行
    for (let j = 0; j < n; j++) { // 列
      if (isValid(i, j, record)) {
        let record2 = [...record]
        record2.push(j)
        if (record2.length === n) count++
        else process(i + 1, record2)
      }
    }
  }

  process(0, record)
  return count

}

console.log(queen(4))

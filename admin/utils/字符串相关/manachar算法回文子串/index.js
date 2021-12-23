function getPalindromeRecord(s) { // 获取回文串信息(manachar算法)
  if (!s) return []
  s = '#' + s.split('').join('#') + '#'
  const record = [1]
  let r = -1, c = -1, l = s.length, maxLenIdx = 0, count
  // 121 a 121
  for (let i = 1; i < l; i++) {
    if (i < r) { // 一定满足i在c和r之间
      let len = record[2 * c - i] // i关于c的对称点
      // 原式：(2 * c - i) - (len - 1) / 2 < 2 * c - r
      if (2 * r + 1 < 2 * i + len) { // 对称点范围在最大回文范围左边 1 1211 a 1121
        count = grow(r - i + 1, 2 * (r - i) + 1, i)
      } else if (2 * r + 1 === 2 * i + len) { // 对称点范围和最大回文范围压线 121 a 121
        count = grow((len + 1) / 2, len, i)
      } else { // 对称点范围在最大回文范围里 1121 a 1211
        count = len
      }
    } else {
      count = grow(1, 1, i)
    }
    record.push(count)
    maxLenIdx = (i % 2 === 1 && count > record[maxLenIdx]) ? i : maxLenIdx
  }

  function grow(range, count, i) {
    while (i - range >= 0 && i + range < l && s[i - range] === s[i + range]) {
      count += 2
      if (i + range > r) {
        r = i + range
        c = i
      }
      range++
    }
    return count
  }

  // console.log('最大回文串信息：', {index: maxLenIdx, length: record[maxLenIdx]})
  // console.log(record, s, s.length)
  return record.join('')
}

// [1, 3, 1, 7, 1, 3, 1, 15, 1, 3, 1, 7, 1, 3, 1] '#1#2#1#a#1#2#1#'
getPalindromeRecord('121a121')
getPalindromeRecord('dnncbwoneinoplypwgbwktmvkoimcooyiwirgbxlcttgteqthcvyoueyftiwgwwxvxvg')

checkTrue()

function normal(s) { // 对数器
  s = '#' + s.split('').join('#') + '#'
  let l, r, records = []
  for (let i = 0; i < s.length; i++) {
    l = i - 1
    r = i + 1
    records[i] = 1
    while (l >= 0 && r < s.length && s[l--] === s[r++]) records[i] += 2
  }
  return records.join('')
}

function checkTrue() {
  for (let i = 0; i < 10000; i++) {
    let s = URL.createObjectURL(new Blob()).slice(-5)
    if (normal(s) !== getPalindromeRecord(s)) {
      console.log(s, i)
      break
    }
  }
  console.log('true')
}

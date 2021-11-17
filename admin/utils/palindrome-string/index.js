function getPalindromeRecord(s) { // 获取回文串信息
  if (!s) return []
  s = '#' + s.split('').join('#') + '#'
  const record = [1]
  let r = -1, c = -1, l = s.length, maxLenIdx = 0, count
  // 121 a 121
  for (let i = 1; i < l; i++) {
    if (i < r) { // 一定满足i在c和r之间
      let len = record[2 * c - i] // i关于c的对称点
      // 原式：(2 * c - i) - (len - 1) / 2 < 2 * c - r
      if (2 * r + 1 < 2 * i + len) { // 对称点范围在最大回文范围左边 a121 a 121b，范围是i' - r'
        count = (r - i + 1) * 2 + 1
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

  console.log('最大回文串信息：', {index: maxLenIdx, length: record[maxLenIdx]})
  console.log(record, s, s.length)
}

// [1, 3, 1, 7, 1, 3, 1, 15, 1, 3, 1, 7, 1, 3, 1] '#1#2#1#a#1#2#1#'
getPalindromeRecord('121a121')

// aabstaabd eaabstaabe
// aabstaabe
function KMP(str1, str2) {
  str2 = String(str2)
  let l1 = str1.length, l2 = str2.length
  if (l2 > l1) return -1
  if (str2 === '') return 0
  const record = getMaxRepeatLen(str2)
  // console.log(record)
  let i = 0, j = 0
  while (i < l1 && j < l2) {
    if (str1[i] === str2[j]) {
      i++
      j++
    } else {
      if (record[j] === -1) i++
      else j = record[j]
    }
  }
  return j === l2 ? i - l2 : -1

  // aaaaabb
  function getMaxRepeatLen(str) { // 获取最长相同前后缀长度对应表
    const record = [-1, 0]
    for (let i = 2, len = str.length; i < len; i++) {
      let cur = i - 1, v
      while ((v = record[cur]) > -1) {
        if (str[i - 1] === str[v]) {
          record.push(v + 1)
          break
        } else cur = v
      }
      if (v === -1) record.push(0)
    }
    return record
  }
}

function classicIndexOf(str1, str2) { // 经典查找方法
  str2 = String(str2)
  if (str2 === '') return 0
  let l1 = str1.length, l2 = str2.length
  for (let i = 0; i < l1; i++) {
    let _i = i
    for (let j = 0; j < l2; j++, _i++) {
      if (str1[_i] === str2[j]) {
        if (j === l2 - 1) return i
      } else break
    }
  }
  return -1
}

test()

function test() {
  // console.log(indexOf('abaeaba', ''));
// let s = 'aabstaabdeaabstaabe', t = Date.now()
  let s = 'aaabbbcccssaaabbbcccsssdddeeevvssaaaddbbbccccddddggggaaaaabbbbbbbbbbaaaaaaaaaaaddddddddffffffffeeeffffffffdffffffffy',
    t = Date.now(),
    l = s.length
  for (let i = 0; i < 1000000; i++) {
    let r1 = Math.floor(Math.random() * l), r2 = r1 + l - Math.floor(Math.random() * l), sub = s.slice(r1, r2)
    // sub = 'aaabbccdd'
    // if (KMP(s, sub) !== s.indexOf(sub)) {
    //   console.log(i, r1, r2, sub)
    //   break
    // }
    // classicIndexOf(s, sub)
    KMP(s, sub)
    // s.indexOf(sub)
  }
  console.log('耗时', Date.now() - t)
}

console.log(KMP('aaabbbcccssaaabbbcccsssdddeeevvssaaaddbbbccccddddggggaaaaabbbbbbbbbbaaaaaaaaaaaddddddddffffffffeeeffffffffdffffffffy', 'ffffffffy'));

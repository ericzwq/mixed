// 跳表
class Link {
  value
  next = null

  constructor(value) {
    this.value = value
  }
}

class SkipNode {
  nexts = [] // 类二维数组，nexts.length表示最高层数, nexts里的每个元素都是链表，其指向后续的一个SkipNode
  value = null

  constructor(value, c) {
    this.value = value
    let count = 1
    if (c) count = c
    else while (Math.random() >= 0.5) count++
    this.nexts = new Array(count)
    // console.log({value, count})
  }

}

let i = 0

class SkipList {
  head
  values = {} // 测试用

  constructor(list) {
    this.head = new SkipNode(null)
    this.head.nexts.length = 0
    list.forEach(i => typeof i === 'object' ? this.insert(i.v, i.c) : this.insert(i))
  }

  search(value) {
    let nexts = this.head.nexts, level = nexts.length - 1, count = 0
    while (level >= 0) {
      while (true) {
        count++
        if (nexts[level]?.value === value) {
          // console.log('查询总次数', count, level)
          return nexts[level]
        } else if (nexts[level]?.value < value) {
          nexts = nexts[level].nexts
        } else break
      }
      level--
    }
    // console.log('查询总次数', count, level + 1)
    return null
  }

  insert(value, c) { // c指定最高层数（测试用），为空则随机生成
    if (this.values[value] != null) return false
    let skipNode = new SkipNode(value, c), hNexts = this.head.nexts, nexts = hNexts, pres = null,
      level, maxLevel = skipNode.nexts.length - 1
    hNexts.length = Math.max(hNexts.length, maxLevel + 1)
    level = hNexts.length - 1
    while (level >= 0) {
      while (nexts[level]?.value < value) {
        pres = nexts
        nexts = nexts[level].nexts
      }
      if (maxLevel < level) {
        if (pres) nexts = pres // 回溯
        level--
        continue
      }
      if (!pres) { // 当前最小，hNext和skipNode相连
        let t = hNexts[level]
        hNexts[level] = skipNode
        if (t) skipNode.nexts[level] = t
      } else {
        if (pres[level]) { // 如果pres后有节点next，则把当前节点skipNode插入pres和next中间
          let t = pres[level].nexts[level]
          pres[level].nexts[level] = skipNode
          if (t) skipNode.nexts[level] = t
        } else pres[level] = skipNode
      }
      if (pres) nexts = pres // 回溯
      level--
    }
    this.values[value] = maxLevel
    return true
  }

  delete(value) {
    let nexts = this.head.nexts, pres = nexts, level = nexts.length - 1, flag = false
    while (level >= 0) {
      while (true) {
        if (nexts[level]?.value === value) {
          flag = true
          break
        } else if (nexts[level]?.value < value) {
          pres = nexts
          nexts = nexts[level].nexts
        } else break
      }
      if (flag) { // 找到后开始更新
        if (pres[level].value === value) { // pres === hnexts时
          let t = pres[level].nexts[level]
          t ? pres[level] = t : delete pres[level]
        } else {
          let t = pres[level].nexts[level].nexts[level]
          t ? pres[level].nexts[level] = t : delete pres[level].nexts[level]
        }
      }
      level--
      nexts = pres // 回溯
    }
    delete this.values[value]
    return flag
  }
}

let arr = [], count = 4
for (let i = 0; i < count; i++) arr.push(Math.floor(Math.random() * count))
// arr.push(900)
const skipList = new SkipList([{v: 5, c: 3}, {v: 8, c: 2}, {v: 6, c: 4}, {v: 2, c: 2}])
// const skipList = new SkipList(arr)
// console.log(skipList.search(900), skipList.values[900])
console.log(skipList)

function test() {
  for (let j = 0; j < 1000; j++) {
    let arr = [], count = 1000
    for (let i = 0; i < count; i++) arr.push(Math.floor(Math.random() * count))
    const skipList = new SkipList(arr)
    let key = Math.floor(Math.random() * count)
    // if (!skipList.search(key) && skipList.values[key] != null) return console.error('搜索异常', skipList.search(key), skipList.values[key], skipList, key) // 测试搜索
    // console.log(skipList.search(key), skipList.values[key], skipList, key, Object.keys(skipList.values).length)
    arr.forEach(i => { // 测试删除
      skipList.delete(i)
      if (skipList.search(i)) console.error('删除异常', i, skipList)
    })
    if (Object.keys(skipList.values).length !== 0) return console.log('删除异常', skipList, Object.keys(skipList.values))
  }
  console.log('%csuccess', 'background: green; color: #fff; padding: 5px')
}

let t = Date.now()
// test()
// console.log(Date.now() - t)

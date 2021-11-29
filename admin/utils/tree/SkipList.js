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
    this.nexts = new Array(c)
    console.log({value, count: c})
  }

}

let i = 0

class SkipList {
  head
  values = new Set()

  constructor(list) {
    this.head = new SkipNode(null)
    this.head.nexts.length = 0
    list.forEach(i => typeof i === 'object' ? this.insert(i.v, i.c) : this.insert(i))
    let o = {
      head: {
        nexts: [
          {
            value: 1,
            nexts: []
          },
          {
            value: 1,
            nexts: []
          }
        ], value: null
      }
    }
  }

  search(value) {
    let nexts = this.head.nexts, level = nexts.length - 1
    while (level >= 0) {
      while (true) {
        if (nexts[level]?.value === value) {
          return nexts[level]
        } else if (nexts[level]?.value < value) {
          nexts = nexts[level].nexts
        } else break
      }
      console.log(nexts[level])
      level--
    }
    return null
  }

  insert(value, c) {
    if (this.values.has(value)) return false
    let skipNode = new SkipNode(value, c), hNexts = this.head.nexts, nexts = hNexts, pres = nexts,
      level = nexts.length - 1
    while (level >= 0) {
      while (nexts[level]?.value < value) {
        pres = nexts
        nexts = nexts[level].nexts
      }
      level--
    }
    console.error(nexts, pres, nexts?.[0]?.value, pres?.[0]?.value)
    // if (++i === 2) return
    level = skipNode.nexts.length - 1
    hNexts.length = Math.max(hNexts.length, level + 1)
    if (!nexts.length) { // value当前最大
      while (level >= 0 && !nexts[level]) {
        pres[level--] = skipNode
      }
    } else {
      while (level >= 0) {
        console.log(level, pres.length, pres)
        // if (level >= pres.length) { // 前一个高度小于新增的，高出的部分和head相连
        if (!pres[level]) { // 前一个高度小于新增的，高出的部分和head相连
          skipNode.nexts[level] = nexts[level] || null
          hNexts[level--] = skipNode
        } else {
          pres[level].nexts[level--] = skipNode
          // skipNode.nexts[level] = pres[level].nexts[level] || null
          // pres[level--] = skipNode
        }
      }
    }
    this.values.add(value)
    return true
  }
}

let arr = [], count = 1000
// for (let i = 0; i < count; i++) arr.push(Math.floor(Math.random() * count))
// debugger
const skipList = new SkipList([{v: 5, c: 1}, {v: 8, c: 2}, {v: 6, c: 3}])
// const skipList = new SkipList(arr)
// debugger
// skipList.insert(4)
// skipList.insert(3)
// skipList.insert(2)
// console.log(skipList.search(1), skipList.values.has(1))
console.log(skipList)

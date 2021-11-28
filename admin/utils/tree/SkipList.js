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

  constructor(value) {
    this.value = value
    let count = 1
    while (Math.random() >= 0.5) count++
    this.nexts = new Array(count)
  }

}

class SkipList {
  head

  constructor() {
    this.head = new SkipNode(null)
    this.head.nexts.length = 0
  }

  insert(value) {
    let skipNode = new SkipNode(value), nexts = this.head.nexts, i = 0
    let level = nexts.length - 1, next = nexts[level], pre = null
    console.log(value)
    while (level >= 0) {
      // next = nexts[level]
      while (true) {
        next = nexts[level]
        if (next && next.value < value) {
          pre = nexts
          nexts = next.nexts
        }
        else break
      }
      level--
    }
    console.log(nexts, next)
    nexts = this.head.nexts
    if (!next) { // value当前最小
      i = nexts.length = Math.max(skipNode.nexts.length, nexts.length)
      // while (i >= 0) {
      while (i >= 0 && !nexts[i]) {
        // const node = new Link(value)
        // let node = new SkipNode()
        nexts[i--] = skipNode
        // if (!nexts[i]) nexts[i--] = new Link(value)
        // else {
        // link.next = nexts[i]
        // nexts[i--] = node
        // }
      }
      // nexts =
      // }
    } else {
      i = nexts.length
      nexts.length = Math.max(i, this.head.nexts.length)
      console.log(pre)
      // while (i >= 0) {
      //
      // }
    }
  }
}

const skipList = new SkipList()
// debugger
skipList.insert(2)
skipList.insert(1)
console.log(skipList)

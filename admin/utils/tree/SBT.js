// size balance tree
class SBT extends BST {
  size = 1

  constructor(value) {
    super(value)
  }

  static buildTree(list) {
    const sbt = new SBT(list[0])
    for (let i = 1, l = list.length; i < l; i++) sbt.insert(list[i])
    return sbt
  }

  updateSize(node = this) {
    return node ? node.size = this.updateSize(node.left) + this.updateSize(node.right) + 1 : 0
  }

  isBalance(node = this) {
    return process(node).is

    function process(node) {
      if (!node) return {ls: 0, rs: 0, s: 0, is: true}
      let leftD = process(node.left)
      if (!leftD) return leftD
      let rightD = process(node.right)
      return {
        ls: leftD.s,
        rs: rightD.s,
        s: leftD.s + rightD.s + 1,
        is: rightD.is && leftD.ls <= rightD.s && leftD.rs <= rightD.s && rightD.ls <= leftD.s && rightD.rs <= leftD.s
      }
    }
  }

  //             5
  //        2          8
  //                  7 9
  //                 6
  maintain(node = this) {
    let {left, right} = node
    if (!left && !right) return
    let ls = left?.size || 0, rs = right?.size || 0
    if (Math.abs(ls - rs) < 2) return
    if (left?.left?.size > rs) { // LL [6, 4, 7, 3, 5, 2]
      console.log('ll')
      this.rotateRight(node)
      // this.updateSize(node)
      // 精准更新size，lr型右旋后node的左右节点肯定都存在，无需非空判断左右节点，其他情况同理
      node.right.size = (node.right.left?.size || 0) + (node.right.right?.size || 0) + 1
      node.size = node.left.size + node.right.size + 1
      this.maintain(node.right) // 递归维持孩子变化的节点，包括新node
      this.maintain(node)
    } else if (left?.right?.size > rs) { // LR [6, 3, 7, 2, 4, 5]
      console.log('lr')
      this.rotateLeft(left)
      this.rotateRight(node)
      // this.updateSize(node)
      node.left.size = (node.left.left?.size || 0) + (node.left.right?.size || 0) + 1
      node.right.size = (node.right.left?.size || 0) + (node.right.right?.size || 0) + 1
      node.size = node.left.size + node.right.size + 1
      this.maintain(node.left)
      this.maintain(node.right)
      this.maintain(node)
    } else if (right?.left?.size > ls) { // RL [2, 1, 5, 4, 6, 3]
      console.log('rl')
      this.rotateRight(right)
      this.rotateLeft(node)
      // this.updateSize(node)
      node.left.size = (node.left.left?.size || 0) + (node.left.right?.size || 0) + 1
      node.right.size = (node.right.left?.size || 0) + (node.right.right?.size || 0) + 1
      node.size = node.left.size + node.right.size + 1
      this.maintain(node.left)
      this.maintain(node.right)
      this.maintain(node)
    } else if (right?.right?.size > ls) { // RR [2, 1, 4, 3, 5, 6]
      console.log('rr')
      this.rotateLeft(node)
      // this.updateSize(node)
      node.left.size = (node.left.left?.size || 0) + (node.left.right?.size || 0) + 1
      node.size = node.left.size + node.right.size + 1
      this.maintain(node.left)
      this.maintain(node)
    }
  }

  insert(value) {
    let cur = this, way, records = []
    while (true) {
      if (cur.value === value) return false
      records.push(cur)
      way = cur.value > value ? 'left' : 'right'
      if (!cur[way]) {
        cur[way] = new SBT(value)
        records.forEach(node => node.size++)
        let i = records.length - 1
        while (i >= 0) this.maintain(records[i--])
        break
      }
      cur = cur[way]
    }
    return true
  }

  delete(value) {
    let cur = this, way, records = [], parent, otherWay, after
    while (cur) {
      records.push(cur)
      if (cur.value === value) break
      way = cur.value > value ? 'left' : 'right'
      cur = cur[way]
    }
    if (!cur) return false
    parent = records[records.length - 2] || null
    if (cur.left && cur.right) {
      if (cur.left.size < cur.right.size) {
        way = 'right'
        otherWay = 'left'
      } else {
        way = 'left'
        otherWay = 'right'
      }
      after = cur[way]
      while (after) { // 找后继节点
        if (!after[otherWay]) break
        after = after[otherWay]
      }
      cur.value = after.value
      after === cur[way] ? cur[way] = after[otherWay] : cur[way][otherWay] = after[way]
      cur.size = this.updateSize(cur[way]) + (cur[otherWay]?.size || 0) + 1 // 精准更新size
    } else if (cur.left) {
      if (parent) {
        parent[way] = cur.left
        records[records.length - 1] = cur.left
      } else {
        Object.assign(cur, cur.left)
        records[0] = cur
      }
    } else if (cur.right) {
      if (parent) {
        parent[way] = cur.right
        records[records.length - 1] = cur.right
      } else {
        Object.assign(cur, cur.right)
        records[0] = cur
      }
    } else {
      if (!parent) return false
      parent[way] = null
      parent.size--
      records.pop() // 将parent移出统一更新size方式，因为left，right可能为null:[4,6](delete 6)
    }
    // 统一更新size
    let i = records.length - 2
    while (i >= 0) records[i].size = records[i].left.size + records[i--].right.size + 1 // 在插入维持平衡的基础+records存在的记录：parent[otherWay]是一定存在的
    i = records.length - 1
    while (i >= 0) this.maintain(records[i--])
    return true
  }
}

// const sbt = SBT.buildTree([6, 4, 7, 3, 5, 2]) // ll
// const sbt = SBT.buildTree([2, 1, 4, 3, 5, 6]) // rr
// const sbt = SBT.buildTree([6, 4, 7, 2, 5, 8, 3])
// sbt.delete(3)
// sbt.delete(8)
// sbt.delete(7)
// sbt.delete(2)
// sbt.delete(5)
// console.log(sbt, sbt.isBalance())

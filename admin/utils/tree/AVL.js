// AVL平衡树
class AVL extends BST {
  height = 1

  constructor(value) {
    super(value)
  }

  static buildTree(list) {
    const avl = new AVL(list[0])
    for (let i = 1, l = list.length; i < l; i++) avl.insert(list[i])
    return avl
  }

  ceilSearch(target) {
    let s = null, node = this
    while (node) {
      if (node.value > target) {
        s = node
        node = node.left
      } else if (node.value < target) {
        node = node.right
      } else return target
    }
    return s?.value ?? null
  }

  floorSearch(target) {
    let s = null, node = this
    while (node) {
      if (node.value > target) {
        node = node.left
      } else if (node.value < target) {
        s = node
        node = node.right
      } else return target
    }
    return s?.value ?? null
  }

  updateHeight(node = this) {
    return node ? node.height = Math.max(this.updateHeight(node.left), this.updateHeight(node.right)) + 1 : 0
  }

  isBalance(node = this) {
    return process(node).is

    function process(node) {
      if (!node) return {is: true, height: 0}
      let leftD = process(node.left)
      if (!leftD.is) return leftD
      let rightD = process(node.right)
      return {
        height: Math.max(leftD.height, rightD.height) + 1,
        is: leftD.is && rightD.is && Math.abs(leftD.height - rightD.height) < 2
      }
    }
  }

  maintain(node = this) {
    let way
    if ((node.left?.height || 0) - (node.right?.height || 0) > 1) {
      way = 'left'
    } else if ((node.right?.height || 0) - (node.left?.height || 0) > 1) {
      way = 'right'
    } else return
    let child = node[way]
    if ((child.right?.height || 0) > (child.left?.height || 0)) {
      if (way === 'right') { // RR
        console.log('rr')
        this.rotateLeft(node)
      } else { // LR
        console.log('lr')
        this.rotateLeft(child)
        this.rotateRight(node)
      }
    } else if ((child.right?.height || 0) < (child.left?.height || 0)) {
      if (way === 'right') { // RL
        console.log('rl')
        this.rotateRight(child)
        this.rotateLeft(node)
      } else { // LL
        console.log('ll')
        this.rotateRight(node)
      }
    } else {
      way === 'right' ? this.rotateLeft(node) : this.rotateRight(node)
    }
    return this.updateHeight(node)
  }

  insert(value) { // 无重复值
    let cur = this, way, otherWay, records = []
    while (true) {
      if (value === cur.value) return false
      way = value > cur.value ? 'right' : 'left'
      otherWay = way === 'right' ? 'left' : 'right'
      records.push(cur)
      if (!cur[way]) { // 找到添加节点的位置
        cur[way] = new AVL(value)
        if (!cur[otherWay]) { // 之前无子节点，向上更新高度
          cur.height++
          let i = records.length - 2, pre = cur
          while (i >= 0) {
            cur = records[i]
            if (cur.height <= pre.height) { // 子节点变高导致整棵树变高则继续更新，并统计需要调整的节点
              cur.height = pre.height + 1
              pre = cur
              i--
            } else break
          }
          // return
          i = records.length - 2 // 新增加的节点不需要调整
          while (i >= 0) this.maintain(records[i--]) // 修改完高度，调整节点
        }
        break
      }
      cur = cur[way]
    }
    // console.log(records)
    return true
  }

  delete(value) {
    let node = this, parent = null, way, records = []
    while (node) {
      console.log('add', node.value)
      records.push(node)
      if (node.value === value) break
      parent = node
      way = node.value > value ? 'left' : 'right'
      node = node[way]
    }
    if (!node) return false
    if (node.left && node.right) {
      // let cur, pre = node
      // 哪边高选哪边，默认左
      // if (node.left.height < node.right.height) { // 取右树上最小的节点
      //   cur = node.right
      //   while (true) {
      //     if (!cur.left) break
      //     pre = cur
      //     cur = cur.left
      //   }
      //   node.value = cur.value
      //   if (cur === node.right) { // 右树无左节点，右树头节点cur值替换node，cur的right给新node [1,2,3,0]
      //     node.right = cur.right
      //   } else { // 右树最左节点cur值替换node，cur的right给其父节点pre
      //     pre.left = cur.right
      //   }
      // } else { // 取左树上最大的节点
      //   cur = node.left
      //   while (true) {
      //     if (!cur.right) break
      //     pre = cur
      //     cur = cur.right
      //   }
      //   node.value = cur.value
      //   if (cur === node.left) { // 左树无右节点，左树头节点cur值替换node，cur的left给新node [3,2,1,4]
      //     node.left = cur.left
      //   } else { // 左树最小右节点cur值替换node，cur的left给其父节点pre
      //     pre.right = cur.left
      //   }
      // }
      // ------------------------------------以下内容包含以上注释中替换节点的简写方式-----------------------------------------
      let cur, pre = node, way, otherWay
      way = node.left.height < node.right.height ? 'right' : 'left'
      otherWay = way === 'right' ? 'left' : 'right'
      cur = node[way]
      while (true) { // 找后继节点
        if (!cur[otherWay]) break
        console.log('add2', cur.value)
        records.push(cur)
        cur = (pre = cur)[otherWay]
      }
      node.value = cur.value
      cur === node[way] ? node[way] = cur[way] : pre[otherWay] = cur[way]
      // ---------------------------------------------------------------------------------------------------------------
    } else if (node.left) { // 只有左孩子，孩子将其替换
      if (parent) {
        parent[way] = node.left
        records[records.length - 1] = node.left // 更新平衡检查的元素
      } else {
        Object.assign(node, node.left)
        records[0] = node
      }
    } else if (node.right) { // 只有右孩子，孩子将其替换
      if (parent) {
        parent[way] = node.right
        records[records.length - 1] = node.right
      } else {
        Object.assign(node, node.right)
        records[0] = node
      }
    } else {
      if (!parent) return false // 只有一个元素时无法删除
      parent[way] = null
    }
    this.updateHeight()
    let i = records.length - 1
    while (i >= 0) this.maintain(records[i--])
    return true
  }
}

// let avl = AVL.buildTree([5, 2, 8, 7, 9, 6])
// let avl = AVL.buildTree([5, 3, 6, 2, 4, 1, 8, 7, 9, 5, 11, 43, 334, 56, 88, 22, 33, 44, 99])
// console.log(avl)
// console.log(AVL.isBalance(avl))
// console.log(avl.search(99))

// let b = AVL.buildTree([3, 2, 6, 1, 2.5, 7, 0])
// b.delete(7)
// console.log(b, b.isBalance())
//           3
//    2            6
//  1   2.5           7
// 0

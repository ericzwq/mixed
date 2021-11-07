// 题目
//------------------------------------------------------------------------------------------------------------------
function getMaxTreeWidth(node) { // 获取二叉树的最大宽度
  let curNode = null, endNode = node, stack = [], maxWidth = 0, curWidth = 0, nextEndNode = null
  stack.push(node)
  while (stack.length) {
    curNode = stack.shift()
    curWidth++
    if (curNode.left) stack.push(curNode.left)
    if (curNode.right) stack.push(curNode.right)
    nextEndNode = stack[stack.length - 1]
    if (curNode === endNode) {
      maxWidth = maxWidth > curWidth ? maxWidth : curWidth
      curWidth = 0
      endNode = nextEndNode
    }
  }
  return maxWidth
}

// let width = getMaxTreeWidth(node)
// console.log(width)
//------------------------------------------------------------------------------------------------------------------
function isFBT(node) { // 是否为满二叉树
  let {count, height, is} = isFBTProccess(node)
  return is && (2 ** height - 1) === count
}

function isFBTProccess(node) {
  if (!node) return {count: 0, height: 0, is: true}
  let {left, right} = node, is = true
  if ((!left && right) || (!right && left)) return {count: 1, height: 1, is: false}
  let leftD = isFBTProccess(left), rightD = isFBTProccess(right)
  return {
    count: leftD.count + rightD.count + 1,
    is: is && leftD.is && rightD.is,
    height: Math.max(leftD.height, rightD.height) + 1
  }
}

// console.log(isFBT(buildTreeByList([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])))
//------------------------------------------------------------------------------------------------------------------
function isBBT(node) { // 是否为平衡二叉树
  return isBBTProcess(node).is
}

function isBBTProcess(node) {
  if (!node) return {is: true, height: 0}
  let leftD = isBBTProcess(node.left), rightD = isBBTProcess(node.right)
  return {
    is: leftD.is && rightD.is && (Math.abs(leftD.height - rightD.height) <= 1),
    height: Math.max(leftD.height, rightD.height) + 1
  }
}

// console.log(isBBT(buildTreeByList([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,16])))
// console.log(isBBT(buildTreeByList([1, 2, null, 3])))

//------------------------------------------------------------------------------------------------------------------
function isSBT(node) { // 是否为搜索二叉树
  return isSBTProcess(node).is
}

function isSBTProcess(node) {
  if (!node) return null
  let leftD = isSBTProcess(node.left), rightD = isSBTProcess(node.right)
  return {
    is: (leftD ? (leftD.is && leftD.max <= node.value) : true) && (rightD ? (rightD.is && rightD.min >= node.value) : true),
    max: Math.max(node.value, leftD ? leftD.max : -Infinity, rightD ? rightD.max : -Infinity),
    min: Math.min(node.value, leftD ? leftD.min : Infinity, rightD ? rightD.min : Infinity)
  }
}

// console.log(isSBT(buildTreeByList([2, 1, 3, 0, null, null, null, -1, 1])))
//------------------------------------------------------------------------------------------------------------------
function isCBT(node) { // 是否为完全二叉树
  let quene = [], notComplete = false
  quene.push(node)
  while (quene.length) {
    let {left, right} = quene.shift()
    if (right && !left) return false // 有右无左直接false
    if (notComplete && (left || right)) return false // 发现叶节点不全后又出现叶节点不全
    if (left && !right) notComplete = true // 首次叶节点不全
    if (left) quene.push(left)
    if (right) quene.push(right)
  }
  return true
}

// console.log(isCBT(buildTreeByList([1, 2, 3, 4, 0, 0, 7, null, 1, 1, 1, 1])))
//------------------------------------------------------------------------------------------------------------------
function lowestAncestor(node, n1, n2) { // 同一颗树上的最低公共祖先（头节点）
  const parentMap = new Map()
  buildParentMap(node, null, parentMap)
  const n1ParentSet = new Set() // n1及n1所有祖先节点
  n1ParentSet.add(n1)
  let cur = n1, parent
  while (parent = parentMap.get(cur)) {
    n1ParentSet.add(parent)
    cur = parent
  }
  cur = n2
  while (parent = parentMap.get(cur)) {
    if (n1ParentSet.has(parent)) return parent
    cur = parent
  }
}

function buildParentMap(node, parent, map) {
  if (!node) return
  map.set(node, parent)
  buildParentMap(node.left, node, map)
  buildParentMap(node.right, node, map)
}

//       1
//   2         3
// 4  0       0 7
//n 1 1 1    1
// const lowestAncestorNode = buildTreeByList([1, 2, 3, 4, 0, 0, 7, null, 1, 1, 1, 1]), n1 = lowestAncestorNode.left.left,
//   n2 = lowestAncestorNode.right.right
// console.log(lowestAncestor(lowestAncestorNode, n1, n2))
//------------------------------------------------------------------------------------------------------------------

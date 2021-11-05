class Node {
  constructor(value) {
    this.value = value;
    this.left = this.right = null;
  }
}

let node = new Node(5)
let nodeL = new Node(4)
let nodeR = new Node(7)
let nodeRL = new Node(6)
let nodeRLR = new Node(9)
nodeRL.right = nodeRLR
let nodeRR = new Node(8)
nodeR.left = nodeRL
nodeR.right = nodeRR
let nodeLL = new Node(3)
let nodeLLL = new Node(1)
nodeLL.left = nodeLLL
let nodeLR = new Node(10)
nodeL.left = nodeLL
nodeL.right = nodeLR
node.left = nodeL
node.right = nodeR
//            5
//      4           7
//   3    10     6     8
//1                 9
console.log(node)
let width = getMaxTreeWidth(node)
console.log(width)

function getMaxTreeWidth(node) { // 获取树的最大宽度
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

function preOrder(node) { // 递归先序遍历
  if (!node) return
  console.log(node.value)
  preOrder(node.left)
  preOrder(node.right)
}

function inOrder(node) { // 递归中序遍历
  if (!node) return
  inOrder(node.left)
  console.log(node.value)
  inOrder(node.right)
}

function postOrder(node) { // 递归后序遍历
  if (!node) return
  postOrder(node.left)
  postOrder(node.right)
  console.log(node.value)
}

function preOrder2(node) { // 非递归先序遍历
  let stack = []
  stack.push(node)
  while (stack.length) {
    let curNode = stack.pop()
    console.log(curNode.value)
    if (curNode.right) stack.push(curNode.right) // 先放右再放左
    if (curNode.left) stack.push(curNode.left)
  }
}

function inOrder2(node) { // 非递归中序遍历
  let stack = [], curNode = node
  while (curNode) { // 从根开始，放入所有最左节点
    stack.push(curNode)
    curNode = curNode.left
  }
  while (stack.length) {
    curNode = stack.pop()
    console.log(curNode.value)
    curNode = curNode.right
    while (curNode) { // 该节点的右孩子开始，放入所有最左节点
      stack.push(curNode)
      curNode = curNode.left
    }
  }
}

function postOrder2(node) { // 非递归后序遍历
  let stack = [], collect = []
  stack.push(node)
  while (stack.length) {
    let curNode = stack.pop()
    collect.push(curNode.value)
    if (curNode.left) stack.push(curNode.left) // 先放左再放右
    if (curNode.right) stack.push(curNode.right)
  }
  while (collect.length) console.log(collect.pop())
}

// 遍历树
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

function sequence(node) { // 递归层序遍历
  if (!node) return
  sequenceProcess([node])
}

function sequenceProcess(nodes) {
  let quene = []
  nodes.forEach(node => {
    console.log(node.value)
    if (node.left) quene.push(node.left)
    if (node.right) quene.push(node.right)
  })
  if (quene.length) sequenceProcess(quene)
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
  let stack = [], collectStack = []
  stack.push(node)
  while (stack.length) {
    let curNode = stack.pop()
    collectStack.push(curNode.value)
    if (curNode.left) stack.push(curNode.left) // 先放左再放右
    if (curNode.right) stack.push(curNode.right)
  }
  while (collectStack.length) console.log(collectStack.pop())
}

function sequence2(node) { // 非递归层序遍历
  let quene = [], curNode
  quene.push(node)
  while (quene.length) {
    curNode = quene.shift()
    console.log(curNode.value)
    if (curNode.left) quene.push(curNode.left)
    if (curNode.right) quene.push(curNode.right)
  }
}

function preOrderSerialize(node) { // 前序遍历序列化二叉树
  return node ? node.value + '_' + preOrderSerialize(node.left) + preOrderSerialize(node.right) : '#_'
}

function inOrderSerialize(node) { // 中序遍历序列化二叉树
  return node ? inOrderSerialize(node.left) + node.value + '_' + inOrderSerialize(node.right) : '#_'
}

function postOrderSerialize(node) { // 后序遍历序列化二叉树
  return node ? postOrderSerialize(node.left) + postOrderSerialize(node.right) + node.value + '_' : '#_'
}

function preOrderDeserialize(str) { // 前序遍历反序列化二叉树
  function process(nodes) {
    let value = nodes.shift()
    if (!value) return
    if (value === '#') return null
    const root = new Node(+value)
    root.left = process(nodes)
    root.right = process(nodes)
    return root
  }

  return process(str.split('_'))
}

function preOrderDeserialize2(str) { // 前序遍历反序列化二叉树2
  let nodes = str.split('_').slice(0, -1).map(i => i === '#' ? null : new Node(+i)), stack = [], parent, node,
    child = 'left'
  parent = nodes[0]
  stack.push(parent)
  for (let i = 1, l = nodes.length - 1; i < l; i++) {
    node = nodes[i]
    parent[child] = node
    if (!node) {
      parent = stack.pop() // 为空则取出栈中下一个节点（若为叶子节点，该节点会2次入栈）
      if (child === 'left') child = 'right' // 左节点为空，此时需要继续为该父节点添加右子树
    } else {
      parent = node
      stack.push(node)
      if (child === 'right') child = 'left'
    }
  }
  return nodes[0]
}

// preOrderDeserialize(preOrderSerialize(node))
// preOrderDeserialize2(preOrderSerialize(node))

/*------------------------------只有一种中序列化结果无法反序列化为唯一的二叉树------------------------------*/
//  中序序列化后都为：null,4,null,3,null,2,null,1,null
// console.log(inOrderSerialize(buildTreeByList([1, 2, null, 3, null, null, null, 4, null, null, null, null, null, null, null])))
// console.log(inOrderSerialize(buildTreeByList([3, 4, 1, null, null, 2, null])))
//        1                和                   3
//      2                                   4       1
//    3                                           2
//  4
//-----------------------------------------------------------------------------------------------------
function postOrderDeserialize(str) { // 后序遍历反序列化二叉树
  function process(nodes) {
    let value = nodes.pop()
    if (!value) return
    if (value === '#') return null
    let root = new Node(+value)
    root.right = process(nodes)
    root.left = process(nodes)
    return root
  }

  return process(str.split('_').slice(0, -1))
}

// console.log(postOrderDeserialize(postOrderSerialize(node)))

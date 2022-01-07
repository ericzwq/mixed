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
  let queue = []
  nodes.forEach(node => {
    console.log(node.value)
    if (node.left) queue.push(node.left)
    if (node.right) queue.push(node.right)
  })
  if (queue.length) sequenceProcess(queue)
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
  let queue = [], curNode
  queue.push(node)
  while (queue.length) {
    curNode = queue.shift()
    console.log(curNode.value)
    if (curNode.left) queue.push(curNode.left)
    if (curNode.right) queue.push(curNode.right)
  }
}

//             1
//        2         3
//       4 5       6 7
// 如果cur无左孩子，cur向右移动（cur=cur.right）
// 如果cur有左孩子，找到cur左子树上最右的节点，记为mostright
// 如果mostright的right指针指向空，让其指向cur，cur向左移动（cur=cur.left）
// 如果mostright的right指针指向cur，让其指向空，cur向右移动（cur=cur.right）
function morrisPre(node) { // morris前序遍历
  if (!node) return
  let temp
  while (node) {
    if (node.left) {
      temp = node.left
      while (temp.right && temp.right !== node) temp = temp.right
      if (temp.right === node) {
        temp.right = null
        node = node.right
      } else {
        console.log(node.value) // 只打印第一次遍历的
        temp.right = node
        node = node.left
      }
    } else {
      console.log(node.value)
      node = node.right
    }
  }
}

// morrisPre(buildTreeByList([1, 2, 3, 4, 5, 6, 7]))

function morrisIn(node) { // morris中序遍历
  if (!node) return
  let temp
  while (node) {
    if (node.left) {
      temp = node.left
      while (temp.right && temp.right !== node) temp = temp.right
      if (temp.right === node) {
        console.log(node.value) // 有第二次的，只打印第二次遍历的
        temp.right = null
        node = node.right
      } else {
        temp.right = node
        node = node.left
      }
    } else {
      console.log(node.value)
      node = node.right
    }
  }
}

// morrisIn(buildTreeByList([1, 2, 3, 4, 5, 6, 7]))

function morrisPost(node) { // morris后序遍历
  if (!node) return
  let temp, head = node
  while (node) {
    if (node.left) {
      temp = node.left
      while (temp.right && temp.right !== node) temp = temp.right
      if (temp.right === node) {
        temp.right = null
        reversePrint(node.left) // 只逆序打印第二次遍历的左树右边界
        node = node.right
      } else {
        temp.right = node
        node = node.left
      }
    } else {
      node = node.right
    }
  }
  reversePrint(head) // 逆序打印整树的右边界

  function reversePrint(node) { // 逆序打印右节点
    node = reverse(node)
    let temp, last = null
    while (node) { // 打印并还原
      console.log(node.value)
      temp = node.right
      node.right = last
      last = node
      node = temp
    }
    return last
  }

  function reverse(node) { // 逆序
    let temp, pre = null
    while (node) {
      temp = node.right
      node.right = pre
      pre = node
      node = temp
    }
    return pre
  }
}

// morrisPost(buildTreeByList([1, 2, 3, 4, 5, 6, 7]))

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

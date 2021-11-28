class Node {
  value
  left = null
  right = null

  constructor(value) {
    this.value = value
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
//['#', '1', '#', '3', '#', '4', '#', '10', '#', '5', '#', '6', '#', '9', '#', '7', '#', '8', '#', '']
// console.log(node)

function buildTreeByList(list) { // 根据完全数组生成二叉树
  if (!Array.isArray(list)) throw 'the first parameter must be type Array'
  if (!list?.length) return null
  let curNode, nodeList = list.map(i => i === null ? null : new Node(i))
  for (let i = 0, l = list.length - 1; i < l; i++) {
    curNode = nodeList[i]
    let left = 2 * i + 1, right = 2 * i + 2
    if (nodeList[left]) curNode.left = nodeList[left]
    if (nodeList[right]) curNode.right = nodeList[right]
  }
  return nodeList[0]
}

//             1
//      2               3
//     5 4             5 7
// console.log(buildTreeByList([1, 2, 3, 5, 4, 5, 7,8]))

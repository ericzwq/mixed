// 搜索二叉树相关
class BST {
  value
  left = null
  right = null

  constructor(value) {
    this.value = value
  }

//            5
//       2         8
//               7   9
//              6

//            8
//       5         9
//     2   7
//        6
  static rotateLeft(node) {
    // [5, 2, 8, 7, 9, 6]
    // 不依赖父节点向左旋转二叉树，node：指定的旋转头，target：node的右节点；target的左儿子（若存在）变为node的右儿子，node变为target的左儿子。
    const target = node.right, nodeV = node.value, nodeL = node.left, targetL = target.left
    // node的值和节点改为target的值, node右子为原target右子，node左子为target（位置互换）
    node.value = target.value
    node.right = target.right
    node.left = target
    // target值更换为原node值，target右子为原target左子，target左子为原node的左子
    target.value = nodeV
    target.right = targetL
    target.left = nodeL
    return node
  }

//           5
//       3       6
//     2  4
//   1

  static rotateRight(node) { // 不依赖父节点向右旋转二叉树 [5, 3, 6, 2, 4, 1]
    const target = node.left, nodeV = node.value, nodeR = node.right, targetR = target.right
    // node改为target信息
    node.value = target.value
    node.right = target
    node.left = target.left
    // target改为node信息
    target.value = nodeV
    target.right = nodeR
    target.left = targetR
    return node
  }

  //    3
  //  1   4
  //   2
  insert(value) { // 无重复值
    let cur = this, way, record = [cur]
    while (true) {
      way = value > cur.value ? 'right' : 'left'
      if (!cur[way]) {
        cur[way] = new BST(value)
        break
      }
      cur = cur[way]
      record.push(cur)
    }
    // while (record.length) {
    //   cur = record.pop()
    //   if (!BST.isBalance(cur)) {
    //
    //   }
    // }
  }

  static isBalance(node) {
    return process(node).is

    function process(node) {
      if (!node) return {is: true, height: 0}
      let leftD = process(node.left), rightD = process(node.right)
      return {
        height: Math.max(leftD.height, rightD.height) + 1,
        is: leftD.is && rightD.is && Math.abs(leftD.height - rightD.height) < 2
      }
    }
  }

  static buildBST(list) {
    const bst = new BST(list[0])
    for (let i = 1, l = list.length; i < l; i++) bst.insert(list[i])
    return bst
  }
}

// let bst = BST.buildBST([5,3, 6, 2, 4, 1])
let bst = BST.buildBST([5, 2, 8, 7, 9, 6])
console.log(bst)
console.log(BST.isBalance(bst))
BST.rotateLeft(bst)
BST.rotateRight(bst)
console.log(bst)
// buildBST([5, 2, 8, 7, 9, 6])

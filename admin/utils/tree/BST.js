class BST {
  value
  left = null
  right = null

  constructor(value) {
    this.value = value
  }

  search(value) {
    let cur = this
    while (cur) {
      if (cur.value === value) return cur
      cur = cur[cur.value > value ? 'left' : 'right']
    }
    return null
  }

  rotateLeft(node = this) {
    //            5
    //       2         8
    //               7   9
    //              6

    //            8
    //       5         9
    //     2   7
    //        6
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

  rotateRight(node = this) {
    //           5
    //       3       6
    //     2  4
    //   1

    //         3
    //    2        5
    //   1        4 6
    // 不依赖父节点向右旋转二叉树 [5, 3, 6, 2, 4, 1]
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
}

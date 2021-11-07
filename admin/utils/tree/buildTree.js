/**
 * 通过前序和中序遍历得到该二叉树并层序输出
 * @param preorder 前序列表
 * @param inorder 中序列表
 */
let buildTree = function (preorder, inorder) {
  if (!preorder.length) return null
  let tree = new TreeNode(), res = [], depth = 0,
    isObject = v => Object.prototype.toString.call(v).slice(8, -1) === 'Object'

  function TreeNode(val) {
    this.val = val;
    this.left = this.right = null;
  }

  function build(preorder, inorder, tree) { // 构建二叉树
    let leftD = 0, rightD = 0, count = 1
    let val = preorder[0],
      inIdx = inorder.indexOf(val),
      left = inorder.slice(0, inIdx),
      right = inorder.slice(inIdx + 1)
    tree.val = val
    if (left.length > 1) {
      leftD = build(preorder.slice(1, left.length + 1), left, tree.left = new TreeNode())
    } else if (left.length === 1) {
      tree.left = new TreeNode(left[0])
      leftD = 1
    }
    if (right.length > 1) {
      rightD = build(preorder.slice(-right.length), right, tree.right = new TreeNode())
    } else if (right.length === 1) {
      tree.right = new TreeNode(right[0])
      rightD = 1
    }
    return count + (leftD > rightD ? leftD : rightD)
  }

  depth = build(preorder, inorder, tree)

  /**
   * 层序输出树结构
   * @param trees[] 树列表
   * @param depth 树的总的深度
   * @param d 当前遍历的深度
   */
  function outputTree(trees, depth, d = 1) {
    if (d > depth) return
    let data = []
    trees.forEach(tree => {
      if (isObject(tree)) {
        let {val, left, right} = tree
        res.push(val)
        if (left) data.push(left)
        else data.push(null)
        if (right) data.push(right)
        else data.push(null)
      } else {
        res.push(tree)
        data = data.concat([null, null])
      }
    })
    outputTree(data, depth, d + 1)
  }

  console.log({tree, depth})
  outputTree([tree], depth)
  console.log(res)

  /**
   * 获取树的深度
   * @param tree
   * @returns {number}
   */
  function getTreeDepth(tree) {
    if (!tree) return 0
    let {val, left, right} = tree, n1 = 0, n2 = 0, count = 0
    if (val !== undefined) count++
    if (left) n1 = getTreeDepth(left)
    if (right) n2 = getTreeDepth(right)
    return count + (n1 > n2 ? n1 : n2)
  }

  console.log(getTreeDepth(tree))
  return res
}
// buildTree([3, 9, 20, 15, 7], [9, 3, 15, 20, 7])
// buildTree(['E', 'A', 'C', 'B', 'D', 'G', 'F'], ['A', 'B', 'C', 'D', 'E', 'F', 'G'])
// buildTree([3, 9, 6, 20, 15, 7], [9, 6, 3, 15, 20, 7])

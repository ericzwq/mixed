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
    function process(node) {
      if (!node) return {is: true, size: 0}
      let leftD = process(node.left), rightD = process(node.right)

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

        break
      }
      cur = cur[way]
    }
  }
}

//             5
//        2          8
//                  7 9
//                 6
const sbt = SBT.buildTree([5, 2, 8, 7, 9, 6])
console.log(sbt)

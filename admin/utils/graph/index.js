class Graph {
  constructor({nodes, edges} = {}) {
    this.nodes = nodes || new Map()
    this.edges = edges || new Set()
  }
}

class Node {
  constructor({enter, out, value, nexts, edges} = {}) {
    this.enter = enter ?? 0
    this.out = out ?? 0
    this.value = value
    this.nexts = nexts || new Set()
    this.edges = edges || new Set()
  }
}

class Edge {
  constructor({from, to, weight} = {}) {
    this.from = from
    this.to = to
    this.weight = weight
  }
}

//  1----------->2------------>4-------------->7
//  |    (7)          (20)     |      (8)        (50)
//  |(4)                   (6) |                         8
//  3     (2)    6     (9)     5    (1000)     9   (1)
let matrix = [ // 8,9             3,6              1,3
  [7, 1, 2],
  [4, 1, 3],
  [20, 2, 4],
  [6, 4, 5],
  [100, 3, 2],
  [2, 3, 6],
  [9, 6, 5],
  [8, 4, 7],
  [50, 7, 8],
  [1000, 5, 9],
  [1, 9, 8]
]

/**
 * 通过数组表示的图转换为graph对象
 * @param matrix 数组数据源
 * @param directed 是否构建为有向图，默认是
 * @returns {Graph}
 */
function buildGraphByMatrix(matrix, directed = true) {
  const graph = new Graph(), nodes = graph.nodes
  matrix.forEach(i => {
    const weight = i[0], from = i[1], to = i[2]
    const edge = new Edge({weight})
    let fromNode = nodes.get(from)
    if (!fromNode) {
      fromNode = new Node({value: from})
      nodes.set(from, fromNode)
    }
    let toNode = nodes.get(to)
    if (!toNode) {
      toNode = new Node({value: to})
      nodes.set(to, toNode)
    }
    edge.from = fromNode
    edge.to = toNode
    fromNode.out++
    fromNode.nexts.add(toNode)
    fromNode.edges.add(edge)
    toNode.enter++
    if (!directed) {
      fromNode.enter++
      toNode.out++
      toNode.edges.add(edge)
      toNode.nexts.add(fromNode)
    }
    graph.edges.add(edge)
  })
  return graph
}

const directedGraph = buildGraphByMatrix(matrix)
const undirectedGraph = buildGraphByMatrix(matrix, false)

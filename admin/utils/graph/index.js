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

//  1----------->2------------>4
//  |    (7)          (20)     |
//  |(4)                   (6) |
//  3                          5
let matrix = [
  [7, 1, 2],
  [4, 1, 3],
  [20, 2, 4],
  [6, 4, 5],
  [100, 3, 2]
]

function buildGraphByMatrix(matrix) {
  const graph = new Graph()
  matrix.forEach(i => {
    const weight = i[0], from = i[1], to = i[2]
    const edge = new Edge({weight})
    const fromNode = new Node({value: from})
    const toNode = new Node({value: to})
    edge.from = fromNode
    edge.to = toNode
    fromNode.out++
    fromNode.nexts.add(toNode)
    fromNode.edges.add(edge)
    to.enter++
    if (!graph.nodes.has(from)) graph.nodes.set(from, fromNode)
    if (!graph.nodes.has(to)) graph.nodes.set(to, toNode)
    graph.edges.add(edge)
  })
  return graph
}

const graph = buildGraphByMatrix(matrix), stack = []
console.log(graph.nodes)
const grapher = graph.nodes.entries()
let {value: [key, value]} = grapher.next(), cur, visited = new Set()
stack.push(value)
while (stack.length) {
  cur = stack.pop()

  cur.nexts.forEach(next => stack.push(next))
  console.log(stack)
}

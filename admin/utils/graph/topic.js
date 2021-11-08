function p(graph) { // 找最小权重和到达图中所有点，要求无向图
  const edges = [], used = new Set(), total = graph.nodes.size, res = [], setMap = new Map()
  graph.nodes.forEach(node => setMap.set(node.value, node))
  console.log(graph)
  for (let v of graph.edges) edges.push(v)
  edges.sort((a, b) => b.weight - a.weight)
  let curEdge, hasFrom, hasTo
  while (edges.length) {
    curEdge = edges.pop()
    let from = curEdge.from, to = curEdge.to
    hasFrom = used.has(from)
    if (!hasFrom) used.add(from)
    hasTo = used.has(to)
    if (!hasTo) used.add(to)
    // if (!hasFrom || !hasTo) res.push(curEdge)
    if (!isSameSet(from.value, to.value)) {
      res.push(curEdge)
      union(from.value, to.value)
    }
    // console.log({hasFrom, hasTo}, curEdge)
  }

  console.log(used, res)

  function isSameSet(n1, n2) {
    return setMap.get(n1) === setMap.get(n2)
  }

  function union(n1, n2) {
    setMap.set(n2, setMap.get(n1))
    // console.log(n1, n2, setMap.get(n1), setMap.get(n2))
  }
}

p(undirectedGraph)

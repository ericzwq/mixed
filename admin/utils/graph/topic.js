function prime(graph) { // 找最小权重和到达图中所有点，要求无向图
  const edges = [], used = new Set(), total = graph.nodes.size, res = [], setMap = new Map(),priorityQuene = []
  graph.nodes.forEach(node => setMap.set(node.value, node))
  let {value: [, curNode]} = graph.nodes.entries().next()
  curNode.edges.forEach(edge => priorityQuene.push(edge))
  used.add(curNode)
  let curEdge = getMinWeightAndUnusedEdge(priorityQuene, used)
  if (curEdge) {
    res.push(curEdge)
    curEdge.to.edges.forEach(edge => priorityQuene.push(edge))
  }

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
  function getMinWeightAndUnusedEdge(quene, used) { // 获取最低权重边，并且删除重复边
    let min = quene[0], deleteIdxs = []
    for (let i = 1; i < quene.length; i++) {
      let dege = quene[i]
      if (used.has(edge.to)){
        deleteIdxs.push(i)
      } else {
        if (edge.weight < min.weight) min = edge
      }
    }
    deleteIdxs.forEach(i => quene.splice(i, 1))
    if (min === quene[0]) return used.has(min.to) ? null : quene.shift()
  }
}

prime(undirectedGraph)

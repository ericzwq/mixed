function prime(graph) { // prime算法找最小权重和到达图中所有点，要求无向图，时间复杂度O(n^2)，n为顶点数，时间与边数无关，适用于稠密图
  const usedNodes = new Set(), res = [], total = graph.nodes.size - 1
  let {value: [, curNode]} = graph.nodes.entries().next(), edgeQuene = [], curEdge
  curNode.edges.forEach(edge => edgeQuene.push(edge))
  usedNodes.add(curNode)
  while (edgeQuene.length && res.length < total) { // 防止边很多的情况
    curEdge = getMinWeightAndUnusedEdge(edgeQuene, usedNodes)
    if (!curEdge) break
    edgeQuene = edgeQuene.filter(() => true) // 稀疏数组转正常数组
    res.push(curEdge)
    usedNodes.add(curEdge.to)
    curEdge.to.edges.forEach(edge => edgeQuene.push(edge))
  }
  return res

  function getMinWeightAndUnusedEdge(edgeQuene, usedNodes) { // 获取最低权重边，并且删除重复边
    let min, lastIdx = -1
    for (let i = 1; i < edgeQuene.length; i++) {
      let edge = edgeQuene[i]
      if (!edge) continue
      if (usedNodes.has(edge.to)) delete edgeQuene[i] // 已经有的边不要
      else {
        if (!min) min = edge
        else if (edge.weight < min.weight) {
          min = edge
          lastIdx = i
        }
      }
    }
    if (min === edgeQuene[0]) min = usedNodes.has(min.to) ? null : edgeQuene.shift()
    else delete edgeQuene[lastIdx]
    return min
  }
}

// console.log(prime(undirectedGraph), 'prime');

function kruskal(graph) { // kruskal算法找最小权重和到达图中所有点，要求无向图，时间复杂度elog2e，e为边数，时间与顶点数无关，适用于稀疏图
  const usedNodes = new Set(), res = [], setMap = new Map(), priorityQuene = [], total = graph.nodes.size - 1
  graph.nodes.forEach(({value}) => setMap.set(value, {head: value, data: [value]}))
  graph.edges.forEach(edge => priorityQuene.push(edge))
  priorityQuene.sort((a, b) => b.weight - a.weight)
  let curEdge
  while (priorityQuene.length && res.length < total) { // 防止边很多的情况
    curEdge = priorityQuene.pop()
    let fromNode = curEdge.from, toNode = curEdge.to
    if (!usedNodes.has(fromNode)) usedNodes.add(fromNode)
    if (!usedNodes.has(toNode)) usedNodes.add(toNode)
    if (!isSameSet(fromNode.value, toNode.value)) {
      res.push(curEdge)
      union(fromNode.value, toNode.value)
    }
  }
  return res

  function isSameSet(n1, n2) { // 2个节点是否为同一个集合
    return setMap.get(n1).head === setMap.get(n2).head
  }

  function union(n1, n2) { // 合并为一个集合
    let node1 = setMap.get(n1), data1 = node1.data, data2 = setMap.get(n2).data, head = node1.head
    data1.push(...data2)
    data2.forEach(k => setMap.set(k, {head, data: data1}))
  }
}

// console.log(kruskal(undirectedGraph), 'kruskal');

function dijkstra(graph) { // node点到distanceMap中所有点的最短距离
  const distanceMap = new Map(), res = {distanceMap}, usedNodes = new Set(), total = graph.nodes.size, heap = []
  let {value: [, curNode], done} = graph.nodes.entries().next(), curDistance = 0
  res.node = curNode
  distanceMap.set(curNode, 0)
  while (usedNodes.size < total) {
    curNode.edges.forEach(edge => {
      let distance = distanceMap.get(edge.to)
      if (distance == null) distanceMap.set(edge.to, edge.weight + curDistance)
      // heapify(heap, heap.push(edge.to) - 1, node => distanceMap.get(node)) // 构建堆
      else distanceMap.set(edge.to, Math.min(edge.weight + curDistance, distance))
    })
    usedNodes.add(curNode)
    curNode = findMinDistanceAndUnusedNode()
    curDistance = distanceMap.get(curNode)
  }
  return res

  function heapify(heap, index, cb) { // 小根堆化，数据条件：除index索引项外需为小根堆结构
    let parent, max = heap.length - 1
    while ((parent = Math.floor((index - 1) / 2)) >= 0 && cb(heap[parent]) > cb(heap[index])) { // 向上
      swap(heap, index, parent)
      index = parent
    }
    let left = index * 2 + 1, right = index * 2 + 2, least = cb(heap[left]) > cb(heap[right]) ? right : left
    while (right <= max && cb(heap[index]) > cb(heap[least])) { // 向下
      swap(heap, least, index)
      index = least
      left = index * 2 + 1
      right = index * 2 + 2
      least = cb(heap[left]) > cb(heap[right]) ? right : left
    }
    if (left === max && cb(heap[left]) < cb(heap[max])) swap(heap, left, max)
  }

  function swap(arr, i, j) {
    let t = arr[i]
    arr[i] = arr[j]
    arr[j] = t
  }

  function findMinDistanceAndUnusedNode() {
    let minKey
    distanceMap.forEach((v, k) => { // 查找过程可用堆优化
      if (!usedNodes.has(k)) {
        if (!minKey) minKey = k
        else if (v < distanceMap.get(minKey)) minKey = k
      }
    })
    return minKey
  }
}

console.log(dijkstra(undirectedGraph), 'dijkstra');

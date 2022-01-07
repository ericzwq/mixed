function dfs(graph) { // 深度优先遍历
  const stack = [], noder = graph.nodes.entries(), visited = new Set()
  let {value: [, value]} = noder.next(), cur
  stack.push(value)
  visited.add(value)
  console.log(value, value.value) // 操作时机
  while (stack.length) {
    cur = stack.pop()
    let unused = findFirstUnusedNode(cur.nexts, visited)
    if (unused) {
      console.log({unused}, unused.value) // 操作时机
      stack.push(cur)
      stack.push(unused)
      visited.add(unused)
    }
  }

  function findFirstUnusedNode(set, visited) {
    for (let v of set) {
      if (!visited.has(v)) return v
    }
  }
}

// dfs(directedGraph)

function bfs(graph) { // 广度优先遍历
  const queue = [], noder = graph.nodes.entries(), visited = new Set()
  let {value: [, value]} = noder.next(), cur
  queue.push(value)
  visited.add(value)
  while (queue.length) {
    cur = queue.shift()
    console.log({cur}, cur.value) // 操作时机
    for (let v of cur.nexts) {
      if (!visited.has(v)) {
        queue.push(v)
        visited.add(v)
      }
    }
  }
}

// bfs(directedGraph)

function getRecentlyMaxAndMinValue(data) { // 获取左边最近大于当前值和右边最近大于当前值的结果集，单调栈
  const stack = [], record = []
  // debugger
  for (let i = 0, l = data.length; i < l; i++) {
    let v = data[i], pre
    record[i] = {right: null, left: null, data: v}
    while (stack.length) {
      if (stack[stack.length - 1][1] < v) { // 2 9 1 4
        pre = stack.pop()
        record[pre[0]].right = v
        // if (record[i].left == undefined) {
        // record[i].left = pre[1]
        // }
      } else if (stack[stack.length - 1][1] === v) {
        break
      } else {
        break
      }
    }
    stack.push([i, v])
  }
  let cur
  while (cur = stack.pop()) {
    if (stack.length) {
      record[cur[0]].left = stack[stack.length - 1][1]
    } else record[cur[0]].left = null
  }
  console.log(record, data)
}

// getRecentlyMaxAndMinValue([0, 2, 3, 1])
getRecentlyMaxAndMinValue([1, 1, 2, 2, 1, 1])


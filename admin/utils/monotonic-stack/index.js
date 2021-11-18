function getRecentlyMaxAndMinValue(data) { // 获取左边最近大于当前值和右边最近大于当前值的结果集，单调栈
  const stack = [], record = []
  // debugger
  for (let i = 0, l = data.length; i < l; i++) {
    let v = data[i], pre, flag = true
    record[i] = {right: null, left: null, data: v}
    while (stack.length) {
      if (stack[stack.length - 1][1] < v) { // 2 9 1 4
        pre = stack.pop()
        while (pre.length) {
          pre.pop()
          let _i = pre.pop()
          record[_i].right = v // 弹出时赋值
          if (stack.length) record[_i].left = stack[stack.length - 1][1]
        }
      } else if (stack[stack.length - 1][1] === v) {
        flag = false
        stack[stack.length - 1].push(i, v)
        break
      } else break
    }
    if (flag) stack.push([i, v])
  }
  let cur
  while (cur = stack.pop()) {
    if (stack.length) {
      while (cur.length) {
        cur.pop()
        record[cur.pop()].left = stack[stack.length - 1][1]
      }
    } else record[cur[0]].left = null
  }
  console.log(record, data)
}

// getRecentlyMaxAndMinValue([0, 2, 3, 1])
getRecentlyMaxAndMinValue([1, 1, 2, 2, 1, 1, 3]) // , 1, 3, 2, 4, 5


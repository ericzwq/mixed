function getRecentlyMaxAndMinValue(data) { // 获取左边最近大于当前值和右边最近大于当前值的索引结果集，单调栈
  const stack = [], record = []
  for (let i = 0, l = data.length; i < l; i++) {
    let v = data[i], pre, flag = true, len = stack.length
    record[i] = {right: null, left: null, data: v}
    while (len) {
      if (data[stack[len - 1][0]] < v) {
        pre = stack.pop()
        len = stack.length
        while (pre.length) {
          let _i = pre.pop()
          record[_i].right = i // 弹出时赋值
          if (len) record[_i].left = stack[len - 1][stack[len - 1].length - 1] // 取链的最后一个元素
        }
      } else if (data[stack[len - 1][0]] === v) {
        flag = false
        stack[len - 1].push(i)
        break
      } else break
    }
    if (flag) stack.push([i])
  }
  let cur
  while (cur = stack.pop()) {
    if (stack.length) while (cur.length) record[cur.pop()].left = stack[stack.length - 1][0]
    else record[cur[0]].left = null
  }
  console.log(record, data)
}

getRecentlyMaxAndMinValue([0, 2, 3, 1, 4, 0, 7, 8, 9, 0])
// getRecentlyMaxAndMinValue([1, 1, 2, 2, 1, 1, 3]) // , 1, 3, 2, 4, 5


class SlidingWindow { // 窗口只能向右移动，每移动一步返回该窗口内的最小值
  constructor(data) {
    this.data = data || []
  }

  data
  record = new Set()
  left = -1
  right = -1
  twoWayQuene = []

  rightMove() {
    let {twoWayQuene, data, record} = this
    if (!twoWayQuene.length) {
      if (this.right < data.length - 1) twoWayQuene.push([this.right + 1, data[++this.right]])
      record.add(twoWayQuene.length - 1)
      return twoWayQuene[0]?.[1]
    }
    if (this.right === data.length - 1) return twoWayQuene[0]?.[1]
    let cur, v = data[++this.right]
    while ((cur = twoWayQuene.pop())?.[1] >= v) record.delete(cur[0])
    twoWayQuene.push([this.right, v])
    record.add(this.right)
    return twoWayQuene[0]?.[1]
  }

  leftMove() {
    if (this.left === this.right) return this.twoWayQuene[0]?.[1]
    let {twoWayQuene, data, record} = this
    if (record.has(this.left + 1)) {
      record.delete(++this.left)
      return twoWayQuene.pop()[1]
    }
    this.left++
    return twoWayQuene[0]?.[1]
  }
}

const slidingWindow = new SlidingWindow([7, 6, 5])
console.log(slidingWindow.rightMove(), slidingWindow.twoWayQuene)
console.log(slidingWindow.rightMove(), slidingWindow.twoWayQuene)
console.log(slidingWindow.leftMove(), slidingWindow.twoWayQuene)
console.log(slidingWindow.rightMove(), slidingWindow.twoWayQuene)
console.log(slidingWindow.rightMove(), slidingWindow.twoWayQuene)
console.log(slidingWindow.leftMove(), slidingWindow.twoWayQuene)
console.log(slidingWindow.leftMove(), slidingWindow.twoWayQuene)
console.log(slidingWindow.rightMove(), slidingWindow.twoWayQuene)

console.log(slidingWindow)

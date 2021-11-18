class SlidingWindow { // 窗口只能向右移动，每移动一步返回该窗口内的最小值
  constructor(data) {
    this.data = data || []
  }

  data
  left = -1
  right = -1
  twoWayQuene = [] // 双端队列

  rightMove() {
    let {twoWayQuene, data} = this
    if (!twoWayQuene.length) {
      if (this.right < data.length - 1) twoWayQuene.push([this.right + 1, data[++this.right]])
      return twoWayQuene[0]?.[1]
    }
    if (this.right === data.length - 1) return twoWayQuene[0]?.[1]
    let cur, v = data[++this.right]
    while ((cur = twoWayQuene.pop())?.[1] > v) ;
    if (cur !== undefined) twoWayQuene.push(cur) // 取出的最后一个放回去
    twoWayQuene.push([this.right, v])
    return twoWayQuene[0]?.[1]
  }

  leftMove() {
    if (this.left === this.right) return this.twoWayQuene[0]?.[1]
    let {twoWayQuene, data} = this
    if (twoWayQuene[0][0] === this.left) {
      this.left++
      twoWayQuene.shift()
      return twoWayQuene[0][1]
    }
    this.left++
    return twoWayQuene[0]?.[1]
  }
}

const slidingWindow = new SlidingWindow([7, 6, 6, 4, 5, 6])
console.log(slidingWindow.rightMove())
console.log(slidingWindow.rightMove())
console.log(slidingWindow.rightMove())
console.log(slidingWindow.leftMove())
console.log(slidingWindow.leftMove())
console.log(slidingWindow.leftMove())
console.log(slidingWindow.leftMove())
console.log(slidingWindow.leftMove())
console.log(slidingWindow.rightMove())
console.log(slidingWindow.rightMove())
console.log(slidingWindow.rightMove())
console.log(slidingWindow.rightMove())
console.log(slidingWindow.leftMove())
console.log(slidingWindow.leftMove())
console.log(slidingWindow.leftMove())
console.log(slidingWindow.leftMove())
console.log(slidingWindow.leftMove())
console.log(slidingWindow.rightMove())

console.log(slidingWindow)

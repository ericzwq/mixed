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

// ---------------------------------------------------------------------------------------------------------------------
const MinStack = function () { // min函数，任意使用pop，push，O(1)时间复杂度求当前数据data中最小值
  this.data = []
  this.win = []
};

MinStack.prototype.push = function (x) {
  let {data, win} = this
  data.push(x)
  if (!win.length || win[win.length - 1] >= x) win.push(x) // 从大到小保留
};

MinStack.prototype.pop = function () {
  let {data, win} = this
  if (!data.length) return null
  let res = data.pop()
  if (win[win.length - 1] === res) win.pop()
};

MinStack.prototype.top = function () {
  return this.data.length ? this.data[this.data.length - 1] : null
};

MinStack.prototype.min = function () {
  return this.win.length ? this.win[this.win.length - 1] : null
};

let minStack = new MinStack();
minStack.push(2);
minStack.push(0);
minStack.push(3);
minStack.push(0);
console.log(minStack.min());
console.log(minStack.pop());
console.log(minStack.min());
console.log(minStack.pop());
console.log(minStack.min());
console.log(minStack.pop());
console.log(minStack.min());

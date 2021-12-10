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

// ---------------------------------------------------------------------------------------------------------------------
// 最大不重复子串
function lengthOfLongestSubstring(s) {
  let map = new Map(), max = 0, left = 0, right = 0
  for (let i = 0, l = s.length; i < l; i++) {
    if (map.get(s[i]) != null) { // 有重复，窗口left右移至无重复
      max = Math.max(max, right - left)
      while (s[left] !== s[i]) map.delete(s[left++]) // left左移时删除重复段之间的记录
      left++
    }
    right++ // 有无重复right都需右移
    map.set(s[i], i)
  }
  return Math.max(max, right - left)
}

function lengthOfLongestSubstringPro(s) { // 优化版（预处理）
  let max = 0, map = new Map(), preMax = 0 // preMax代替以每个位置的结尾的最长子串长度结果集，因为结果集只需要依赖前一项
  for (let i = 0, l = s.length; i < l; i++) {
    //  之前出现这个字符的索引，        以i-1位置结尾的最长子串的开头索引
    let index = map.get(s[i]) ?? -1, preStart = i - preMax
    map.set(s[i], i)
    if (index < preStart) {
      // <：abbca-> 考虑i = 4时，s[i-1]最长子串长为2，此时index = 0，preStart = 2
      preMax = preMax + 1
    } else {
      // =：abca-> 考虑i = 3时，s[i-1]最长子串长为3，此时index = 0, preStart = 0
      // >：abcdb-> 考虑i = 4时，s[i-1]最长子串长为4，此时index = 1，preStart = 0
      preMax = i - index
    }
    max = Math.max(max, preMax)
  }
  return max
}

// console.log(test("abcabcbb"))
// console.log(test('abba'))
// console.log(test('1ddcae'))
// console.log(test('auacdef'))
// console.log(test('pwwkewc'))
// ---------------------------------------------------------------------------------------------------------------------
// 输入一个正整数 target ，输出所有和为 target 的连续正整数序列（至少含有两个数）。
// 序列内的数字由小到大排列，不同序列按照首个数字从小到大排列。
// https://leetcode-cn.com/problems/he-wei-sde-lian-xu-zheng-shu-xu-lie-lcof/
function findContinuousSequence(target) {
  let r = Math.ceil(target / 2), res = [], temp = [1, 2], i = 1, j = 2, sum = 3, validLeft = 0
  while (i < j && j <= r) {
    if (sum < target) {
      temp.push(++j)
      sum += j
    } else if (sum > target) {
      validLeft++
      sum -= i
      i++
    } else {
      res.push(temp.slice(validLeft))
      sum -= i
      i++
      validLeft++
    }
  }
  return res
};
// ---------------------------------------------------------------------------------------------------------------------

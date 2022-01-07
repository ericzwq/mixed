/*向数组头部插入元素*/

let l = 100000

console.time('arr')
let arr = []
for (let i = 0; i < l; i++) {
  arr.unshift(i)
}
console.timeEnd('arr')

console.time('arr2')
let arr2 = []
for (let i = 0; i < l; i++) {
  [i].concat(arr2) // better
}
console.timeEnd('arr2')

// arr[arr.length] = i 比 arr.push(i) 稍快

/*函数嵌套会影响性能*/

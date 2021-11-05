/*******************工具函数库*******************/
/**
 * 斐波那契
 * @param n >= 1
 * @returns {number|*}
 */
function fibonacci(n) {
  if (n < 3) return 1
  let a = b = 1, c
  while (n-- > 2) {
    c = BigInt(a + b)
    a = BigInt(b)
    b = BigInt(c)
  }
  return c
}

/**
 * 斐波那契(效率低)
 * @param n >= 1
 * @returns {number|number}
 */
const fibonacci2 = n => n < 3 ? 1 : fibonacci2(n - 1) + fibonacci2(n - 2)

/**
 * 带回调的二分查找
 * @param arr 源数据
 * @param l 左边界
 * @param r 右边界
 * @param cb 查找方法，大于0则向右查找，小于0向左查找，等于即找到
 * @returns {number|number|*|number} 找到的下标
 */
function binarySearch(arr, l, r, cb) {
  if (l > r) return -1
  let m = Math.floor(l + (r - l) / 2)
  let res = cb(arr[m])
  if (res > 0) return binarySearch(arr, m + 1, r, cb) // 向右
  if (res < 0) return binarySearch(arr, l, m - 1, cb) // 向左
  return m
}

/**
 * 生成36位随机数（uuid）
 * @returns {string}
 */
const myRandom = () => URL.createObjectURL(new Blob([])).slice(-36)

/**
 * 判断值是否为null或undefined
 * @param v
 * @returns {boolean}
 */
const isShallowNull = v => (v ?? false) === false // 空值合并运算符

/**
 * 防抖
 * @param cb
 * @param timeout
 * @returns {(function(): void)|*}
 */
function debounce(cb, timeout = 500) {
  let timer
  return function () {
    clearTimeout(timer)
    timer = setTimeout(cb, timeout)
  }
}

/**
 * 节流
 * @param cb
 * @param timeout
 * @returns {(function(): void)|*}
 */
function throttle(cb, timeout = 500) {
  let flag
  return function () {
    if (flag) return
    flag = true
    setTimeout(() => {
      cb()
      flag = false
    }, timeout)
  }
}

/**
 * 判断2个对象是否浅相等
 * @param obj1 {any}
 * @param obj2 {any}
 * @returns {*|boolean}
 */
function isShallowEqual(obj1, obj2) {
  let type1 = type(obj1), type2 = type(obj2)
  if (type1 !== type2) return false
  if (['Object', 'Array'].includes(type1)) {
    if (Object.keys(obj1).length !== Object.keys(obj2).length) return false
    for (let k in obj1) {
      if (!obj2.hasOwnProperty(k)) return false
      if (['Object', 'Array'].includes(type(obj1[k]))) {
        return isShallowEqual(obj1[k], obj2[k])
      } else {
        return obj1[k] === obj2[k]
      }
    }
    return true
  } else {
    return obj1 === obj2
  }
}

/**
 * 判断值类型
 * @param v {any}
 * @returns {string}
 */
function type(v) {
  return Object.prototype.toString.call(v).slice(8, -1)
}

/**
 * 当某个操作的值(action的返回值)改变时执行cb
 * @param action 判断是否改变的方法
 * @param cb 成功的回调
 * @param timeout 判断间隔
 * @param times 判断次数
 * @param errorCb 失败的回调
 * @param timer 定时器的值
 * @returns {number|void}
 */
function afterChange(action, cb, {timeout = 1000, times = 30, errorCb, timer} = {}) {
  if (times < 0) {
    errorCb && errorCb()
    timer = null
    return console.log('afterChange 失败', action)
  }
  let data = action()
  if (timer) clearTimeout(timer) // 传了表示要清除
  timer = setTimeout(() => {
    if (action() === data) return afterChange(action, cb, {timeout, times: --times, errorCb})
    cb && cb(data)
  }, timeout)
  return timer
}

/**
 * 当某个操作的值(action的返回值)存在时执行cb，参数详情同上
 * @param action
 * @param cb
 * @param timeout
 * @param times
 * @param errorCb
 * @param timer
 * @returns {number|void}
 */
function afterExist(action, cb, {timeout = 1000, times = 30, errorCb, timer} = {}) {
  if (times < 0) {
    errorCb && errorCb()
    timer = null
    return console.log('afterExist 失败', action)
  }
  if (timer) clearTimeout(timer) // 传了表示要清除
  timer = setTimeout(() => {
    let data = action()
    if (!data) return afterExist(action, cb, {timeout, times: --times})
    cb && cb(data)
  }, timeout)
  return timer
}

/**
 * 元素改变监听
 * @param cb
 * @param el
 * @param timeout
 * @param observeOptions
 * @param autoDisconnect
 * @param observer
 * @returns {MutationObserver}
 */
function elementListener(cb, el, {
  timeout = 1000,
  observeOptions = {childList: true},
  autoDisconnect = true,
  observer
} = {}) { // 监听元素变化
  let flag
  if (!observer) observer = new MutationObserver((...args) => {
    if (flag) return console.log('被拦截的mutation', args)
    flag = true
    if (autoDisconnect) {
      console.log('移除监听')
      observer.disconnect() // 移除监听，防止多次触发
    }
    cb(...args)
    setTimeout(() => {
      flag = false
    }, timeout) // 1秒冷却触发
  })
  observer.observe(el, observeOptions)
  return observer
}

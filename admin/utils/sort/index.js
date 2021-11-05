function quickSort(arr, l = 0, r = arr.length - 1) { // 1000000-130
  if (l >= r) return
  let lI = l - 1, rI = r, rand = Math.floor(Math.random() * (r - l + 1)) + l, middle = arr[rand]
  swap(arr, r, rand)
  for (let i = l; i < rI;) {
    if (arr[i] > middle) {
      swap(arr, i, --rI)
    } else if (arr[i] < middle) {
      swap(arr, i++, ++lI)
    } else {
      i++
    }
  }
  swap(arr, r, rI)
  quickSort(arr, l, lI)
  quickSort(arr, rI + 1, r)
}

function swap(arr, i, j) {
  let temp = arr[i]
  arr[i] = arr[j]
  arr[j] = temp
}

// -----------------------------------------------------------------------------------------
function quick_sort(s, l, r) { // 菜鸟1000000-105
  if (l < r) {
    //Swap(s[l], s[(l + r) / 2]); //将中间的这个数和第一个数交换 参见注1
    let i = l, j = r, x = s[l];
    while (i < j) {
      while (i < j && s[j] >= x) // 从右向左找第一个小于x的数
        j--;
      if (i < j)
        s[i++] = s[j];

      while (i < j && s[i] < x) // 从左向右找第一个大于等于x的数
        i++;
      if (i < j)
        s[j--] = s[i];
    }
    s[i] = x;
    quick_sort(s, l, i - 1); // 递归调用
    quick_sort(s, i + 1, r);
  }
}

// -----------------------------------------------------------------------------------------
function insertionSort(arr) { // 1000000-164432
  for (let i = 1, l = arr.length; i < l; i++) {
    let j = i - 1, temp = arr[i]
    while (j >= 0 && temp < arr[j]) arr[j + 1] = arr[j--] // while条件顺序影响很大
    arr[j + 1] = temp
  }
  return arr
}

// -----------------------------------------------------------------------------------------
function insertion_sort(arr) { // 菜鸟1000000-164432
  var len = arr.length;
  var preIndex, current;
  for (var i = 1; i < len; i++) {
    preIndex = i - 1;
    current = arr[i];
    while (preIndex >= 0 && arr[preIndex] > current) {
      arr[preIndex + 1] = arr[preIndex];
      preIndex--;
    }
    arr[preIndex + 1] = current;
  }
  return arr;
}

// -----------------------------------------------------------------------------------------
function mergeSort(arr, l = 0, r = arr.length - 1) { // 1000000-47697
  if (l === r) return
  let m = Math.floor(l + (r - l) / 2)
  mergeSort(arr, l, m)
  mergeSort(arr, m + 1, r)
  merge(arr, l, m, r)
}

function merge(arr, l, m, r) {
  let p1 = l, p2 = m + 1
  let help = new Array(r - l + 1)
  while (p1 <= m && p2 <= r) help.push(arr[p1] <= arr[p2] ? arr[p1++] : arr[p2++])
  while (p1 <= m) help.push(arr[p1++])
  while (p2 <= r) help.push(arr[p2++])
  help.forEach(i => arr[l++] = i)
}

// -----------------------------------------------------------------------------------------
function merge_sort(arr) {  // 采用自上而下的递归方法 菜鸟1000000-45502
  var len = arr.length;
  if (len < 2) {
    return arr;
  }
  var middle = Math.floor(len / 2),
    left = arr.slice(0, middle),
    right = arr.slice(middle);
  return merge(merge_sort(left), merge_sort(right));
}

function merge(left, right) {
  var result = [];

  while (left.length && right.length) {
    if (left[0] <= right[0]) {
      result.push(left.shift());
    } else {
      result.push(right.shift());
    }
  }

  while (left.length)
    result.push(left.shift());

  while (right.length)
    result.push(right.shift());

  return result;
}

// -----------------------------------------------------------------------------------------
function mySort(arr, left = 0, right = arr.length - 1) {
  if (left < right) {
    let _left = left, _right = right
    let base = arr[_left]
    // [3,5,76,234,75,2,56]  i = 0, j = 5, x = 3
    // [2,5,76,234,75,2,56] i = 1, j = 5, x = 3
    // [2,5,76,234,75,5,56] // i = 1, j = 5, x = 3
    // [2,3,5,234,75,56,76]
    // [2,3,5,234,75,56,76]
    while (_left < _right) {
      // 从右向左找第一个小于x的数
      for (; _left < _right; _right--) {
        if (arr[_right] < base) {
          arr[_left++] = arr[_right]
          break
        }
      }
      //   for (; _left < _right; _right--) {
      //     if (arr[_right] < base) break
      //   }
      // if (_left < _right) arr[_left++] = arr[_right]
      // console.log({_right})
      // 从左向右找第一个大于等于x的数
      for (; _left < _right; _left++) {
        if (arr[_left] >= base) {
          arr[_right--] = arr[_left]
          break
        }
      }
      // for (; _left < _right; _left++) {
      //   if (arr[_left] >= base) break
      // }
      // if (_left < _right) arr[_right--] = arr[_left]
      // console.log({_left})
      // console.log(arr)
    }
    arr[_left] = base
    // mySort(arr, left, _right - 1)
    // mySort(arr, _left + 1, right)
  }
}

// -----------------------------------------------------------------------------------------
function heapifyAll(arr, l = 0, r = arr.length - 1) { // head -> Math.floor((i - 1) / 2)  right -> 2*i + 2
  let cur, parent
  for (let i = l + 1; i <= r; i++) {
    parent = Math.floor((i - 1) / 2)
    cur = i
    while (parent >= 0 && arr[parent] < arr[cur]) {
      swap(arr, parent, cur)
      cur = parent
      parent = Math.floor((parent - 1) / 2)
    }
  }
}

function heapifyFromHead(arr, r, i = 0) { // r右边界, i起始索引
  let cur = 0, left = 2 * i + 1, right = 2 * i + 2
  while (right <= r && (cur = arr[left] > arr[right] ? left : right) && arr[cur] > arr[i]) {
    swap(arr, cur, i)
    i = cur
    left = 2 * i + 1
    right = 2 * i + 2
  }
  if (left === r && arr[left] > arr[i]) swap(arr, left, i) // 只剩左节点
}

function heapSort(arr) { // 1000000-140
  let r = arr.length - 1
  heapifyAll(arr, 0, r)
  while (r > 0) {
    swap(arr, 0, r--)
    heapifyFromHead(arr, r)
  }
}

// -----------------------------------------------------------------------------------------
var len

function buildMaxHeap(arr) {   // 建立大顶堆
  len = arr.length;
  for (var i = Math.floor(len / 2); i >= 0; i--) {
    heapify(arr, i);
  }
}

function heapify(arr, i) {     // 堆调整
  var left = 2 * i + 1,
    right = 2 * i + 2,
    largest = i;

  if (left < len && arr[left] > arr[largest]) {
    largest = left;
  }

  if (right < len && arr[right] > arr[largest]) {
    largest = right;
  }

  if (largest != i) {
    swap(arr, i, largest);
    heapify(arr, largest);
  }
}

function swap(arr, i, j) {
  var temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}

function heap_sort(arr) { // 菜鸟1000000-264
  buildMaxHeap(arr);

  for (var i = arr.length - 1; i > 0; i--) {
    swap(arr, 0, i);
    len--;
    heapify(arr, 0);
  }
  return arr;
}

// -----------------------------------------------------------------------------------------
var counter = [];

function radix_sort(arr, maxDigit = 9) { // 菜鸟1000000-162046
  var mod = 10;
  var dev = 1;
  for (var i = 0; i < maxDigit; i++, dev *= 10, mod *= 10) {
    for (var j = 0; j < arr.length; j++) {
      var bucket = parseInt((arr[j] % mod) / dev);
      if (counter[bucket] == null) {
        counter[bucket] = [];
      }
      counter[bucket].push(arr[j]);
    }
    var pos = 0;
    for (var j = 0; j < counter.length; j++) {
      var value = null;
      if (counter[j] != null) {
        while ((value = counter[j].shift()) != null) {
          arr[pos++] = value;
        }
      }
    }
  }
  return arr;
}

// -----------------------------------------------------------------------------------------
function radixSort(arr) { // 基数排序1000000-560
  let buckets = new Array(10), max = 0, curLen = 1, maxLen = 0
  for (let i = 0, l = buckets.length; i < l; i++) buckets[i] = []
  arr.forEach(i => {
    max = i > max ? i : max
    buckets[getNum(i, 0)].push(i)
  })
  maxLen = (max + '').length - 1
  fall(buckets, arr)
  while (curLen <= maxLen) {
    arr.forEach(i => buckets[getNum(i, curLen)].push(i)) // 倒进桶
    fall(buckets, arr)
    curLen++
  }
}

function fall(buckets, arr) { // 倒出桶
  let index = 0
  buckets.forEach((bucket, idx) => {
    bucket.forEach(i => {
      arr[index++] = i
    })
    buckets[idx].length = 0
  })
}

function getNum(i, index) {
  let power = 10 ** index
  if (i < power) return 0
  return Math.floor(i / power) % 10
}

// -----------------------------------------------------------------------------------------
function bucket_sort(arr, bucketSize) { // 菜鸟1000000-130
  if (arr.length === 0) {
    return arr;
  }

  var i;
  var minValue = arr[0];
  var maxValue = arr[0];
  for (i = 1; i < arr.length; i++) {
    if (arr[i] < minValue) {
      minValue = arr[i];                // 输入数据的最小值
    } else if (arr[i] > maxValue) {
      maxValue = arr[i];                // 输入数据的最大值
    }
  }

  //桶的初始化
  var DEFAULT_BUCKET_SIZE = 5;            // 设置桶的默认数量为5
  bucketSize = bucketSize || DEFAULT_BUCKET_SIZE;
  var bucketCount = Math.floor((maxValue - minValue) / bucketSize) + 1;
  var buckets = new Array(bucketCount);
  for (i = 0; i < buckets.length; i++) {
    buckets[i] = [];
  }

  //利用映射函数将数据分配到各个桶中
  for (i = 0; i < arr.length; i++) {
    buckets[Math.floor((arr[i] - minValue) / bucketSize)].push(arr[i]);
  }

  arr.length = 0;
  for (i = 0; i < buckets.length; i++) {
    insertionSort(buckets[i]);                      // 对每个桶进行排序，这里使用了插入排序
    for (var j = 0; j < buckets[i].length; j++) {
      arr.push(buckets[i][j]);
    }
  }

  return arr;
}

// -----------------------------------------------------------------------------------------
function bucketSort(arr, bucketSize = 5) { // 1000000-123
  let l = arr.length, bucketCount = 0, max = 0, min = 0
  for (let i = 0; i < l; i++) {
    if (arr[i] > max) max = arr[i]
    else if (arr[i] < min) min = arr[i]
  }
  bucketCount = Math.ceil((max - min + 1) / bucketSize)
  let buckets = new Array(bucketCount)
  for (let i = 0; i < bucketCount; i++) buckets[i] = []
  for (let i = 0; i < l; i++) buckets[Math.floor((arr[i] - min) / bucketSize)].push(arr[i])
  for (let i = 0; i < bucketCount; i++) insertionSort(buckets[i])
  let index = 0
  buckets.forEach(i => i.forEach(i2 => arr[index++] = i2))
}

// -----------------------------------------------------------------------------------------
testSpeed()
// checkTrue()

function testSpeed() { // 测试速度
  let arr = [], newArr, size = 1000000
  for (let i = 0; i < size; i++) {
    arr.push(Math.round(Math.random() * size))
  }
  let arr2 = arr.slice()
  console.log('初始值', arr.slice())
  let t = Date.now()
// quickSort(arr, 0, arr.length - 1)
// quick_sort(arr2, 0, arr2.length - 1)
// insertionSort(arr)
// newArr = mySort(arr)
// mergeSort(arr)
//   heapSort(arr)
  merge_sort(arr)
  console.log('耗时', Date.now() - t)
  console.log('结果', newArr, arr)
}


function checkTrue() { // 测试正确性
  let flag = true
  for (let j = 0; j < 100000; j++) {
    let arr = [], size = 500
    for (let i = 0; i < size; i++) {
      arr.push(Math.round(Math.random() * size))
    }
    let arr2 = arr.slice(), originArr = arr.slice()
    quick_sort(arr2, 0, arr2.length - 1)
    mergeSort(arr)
    flag = arr.every((item, i) => {
      if (arr2[i] !== item) {
        console.log(i, item, arr2[i], arr, arr2, originArr)
        return false
      }
      return true
    })
    if (!flag) break
  }
  console.log(flag)
}

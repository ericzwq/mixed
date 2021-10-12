function quick_sort(s, l, r) { // data, left, right
  if (l < r) {
    //Swap(s[l], s[(l + r) / 2]); //将中间的这个数和第一个数交换 参见注1
    let i = l, j = r, x = s[l];
    while (i < j) {
      while (i < j && s[j] >= x) // 从右向左找第一个小于x的数
        j--;
      if (i < j)
        s[i++] = s[j];
      console.log(i, j, x, s)
      while (i < j && s[i] < x) // 从左向右找第一个大于等于x的数
        i++;
      if (i < j)
        s[j--] = s[i];
      console.log(i, j, x, s)
    }
    s[i] = x;
    quick_sort(s, l, i - 1); // 递归调用
    quick_sort(s, i + 1, r);
  }
}

function insertionSort(arr) {
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

function mergeSort(arr) {  // 采用自上而下的递归方法
  var len = arr.length;
  if (len < 2) {
    return arr;
  }
  var middle = Math.floor(len / 2),
    left = arr.slice(0, middle),
    right = arr.slice(middle);
  return merge(mergeSort(left), mergeSort(right));
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

let arr = [3, 5, 76, 234, 75, 2, 56], newArr
// for (let i = 0; i < 1000000; i++) {
//   arr.push(Math.round(Math.random() * 1000000))
// }
console.log('初始值', arr.slice())
let t = Date.now()
// quick_sort(arr, 0, arr.length - 1)
// insertionSort(arr)
newArr = mySort(arr)
// mergeSort(arr)
console.log('耗时', Date.now() - t)
console.log('结果', newArr, arr)

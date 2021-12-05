// 求矩阵中1的岛屿个数---------------------------------------------------------------------------------------------------------------
function islandCount(arr) {
  let col = arr[0].length, row = arr.length, count = 0
  for (let i = 0; i < row; i++) {
    for (let j = 0; j < col; j++) {
      if (dfs(i, j) !== false) count++
    }
  }

  function dfs(i, j) {
    if (i < 0 || i === row || j < 0 || j === col || arr[i][j] !== 1) return false
    arr[i][j] = 2
    dfs(i + 1, j)
    dfs(i - 1, j)
    dfs(i, j + 1)
    dfs(i, j - 1)
  }

  return count
}

// console.log(islandCount([ // expected: 5
//   [0, 1, 0, 0, 1],
//   [0, 1, 1, 0, 0],
//   [1, 0, 0, 0, 0],
//   [0, 0, 0, 1, 1],
//   [0, 1, 1, 0, 0],
// ]))

// 矩阵中是否完整且连续（上下左右）包含给定word字符串，----------------------------------------------------------------------------------
function existWord(board, word) {
  let row = board.length, col = board[0].length, wdLen = word.length, flag
  if (!wdLen || row * col < word.length) return false
  for (let i = 0; i < row; i++) {
    for (let j = 0; j < col; j++) {
      process(i, j, 0)
    }
  }

  function process(i, j, s) {
    if (i < 0 || i === row || j < 0 || j === col || board[i][j] !== word[s] || flag) return
    if (s === wdLen - 1) return flag = true
    let t = board[i][j]
    board[i][j] = ''
    process(i, j - 1, s + 1)
    process(i, j + 1, s + 1)
    process(i - 1, j, s + 1)
    process(i + 1, j, s + 1)
    board[i][j] = t
  }

  return !!flag
}

// console.log(existWord([ // expected: true
//   ["A", "B", "C", "E"],
//   ["S", "F", "E", "S"],
//   ["A", "D", "E", "E"]], "ABCESEEEFS"))

// 从arr中只能从头或尾一人选一数，2人都非常聪明，从1开始选，求使自己分数尽量高，对手分数尽量低的最后结果----------------------------------------
function getMaxScore(arr) {
  return arr.length < 10 ? f2(arr) : f1(arr) // 数量过小无需优化

  function f1(arr) { // 增加缓存优化
    let map = new Map()
    return process(0, arr.length - 1, 1)

    function process(i, j, which) { // 从i到j选一个数使自己高分，对手尽量最低分
      let key = `${i}-${j}-${which}`
      if (map.has(key)) return map.get(key)
      if (i === j) {
        map.set(key, which === 1 ? {p1: arr[i], p2: 0} : {p1: 0, p2: arr[i]})
        return map.get(key)
      }
      if (which === 1) {
        let r1 = process(i + 1, j, 2), r2 = process(i, j - 1, 2)
        let p1, p2
        if (r1.p1 + arr[i] > r2.p1 + arr[j]) {
          p1 = r1.p1 + arr[i]
          p2 = r1.p2
        } else {
          p1 = r2.p1 + arr[j]
          p2 = r2.p2
        }
        map.set(key, {p1, p2})
        return map.get(key)
      } else {
        let r1 = process(i + 1, j, 1), r2 = process(i, j - 1, 1)
        let p1, p2
        if (r1.p2 + arr[i] > r2.p2 + arr[j]) {
          p1 = r1.p1
          p2 = r1.p2 + arr[i]
        } else {
          p1 = r2.p1
          p2 = r2.p2 + arr[j]
        }
        map.set(key, {p1, p2})
        return map.get(key)
      }
    }
  }

  function f2(arr) {
    return process(0, arr.length - 1, 1)

    function process(i, j, which) {
      if (i === j) return which === 1 ? {p1: arr[i], p2: 0} : {p1: 0, p2: arr[i]}
      if (which === 1) {
        let r1 = process(i + 1, j, 2), r2 = process(i, j - 1, 2)
        let p1, p2
        if (r1.p1 + arr[i] > r2.p1 + arr[j]) {
          p1 = r1.p1 + arr[i]
          p2 = r1.p2
        } else {
          p1 = r2.p1 + arr[j]
          p2 = r2.p2
        }
        return {p1, p2}
      } else {
        let r1 = process(i + 1, j, 1), r2 = process(i, j - 1, 1)
        let p1, p2
        if (r1.p2 + arr[i] > r2.p2 + arr[j]) {
          p1 = r1.p1
          p2 = r1.p2 + arr[i]
        } else {
          p1 = r2.p1
          p2 = r2.p2 + arr[j]
        }
        return {p1, p2}
      }
    }
  }
}

// console.log(getMaxScore([2, 3, 100, 5, 7, 8, 9, 10]))
// console.log(getMaxScore([2, 3, 100, 5, 7, 8, 9, 10, 5, 7, 8, 9, 10, 5, 7, 8, 9, 10]));

// 在一个 m*n 的棋盘的每一格都放有一个礼物，每个礼物都有一定的价值（价值大于 0）。你可以从棋盘的左上角开始拿格子里的礼物，
// 并每次向右或者向下移动一格、直到到达棋盘的右下角。给定一个棋盘及其上面的礼物的价值，请计算你最多能拿到多少价值的礼物？
// 严格表法：f(i, j) = Max[f(i -1, j), f(i, j - 1)] + f(i, j)
function maxValue(grid) {
  if (!grid.length || !grid[0].length) return 0
  let r = grid.length, c = grid[0].length
  for (let i = 1; i < r; i++) grid[i][0] = grid[i - 1][0] + grid[i][0]
  for (let i = 1; i < c; i++) grid[0][i] = grid[0][i - 1] + grid[0][i]
  for (let i = 1; i < r; i++) for (let j = 1; j < c; j++) grid[i][j] = Math.max(grid[i - 1][j], grid[i][j - 1]) + grid[i][j]
  return grid[r - 1][c - 1]
}

// console.log(maxValue([
//   [1, 3, 1],
//   [1, 5, 1],
//   [4, 2, 1]]))

// 求矩阵中1的岛屿个数
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

console.log(islandCount([ // expected: 5
  [0, 1, 0, 0, 1],
  [0, 1, 1, 0, 0],
  [1, 0, 0, 0, 0],
  [0, 0, 0, 1, 1],
  [0, 1, 1, 0, 0],
]))

// 矩阵中是否完整且连续（上下左右）包含给定word字符串，
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

console.log(existWord([ // expected: true
  ["A", "B", "C", "E"],
  ["S", "F", "E", "S"],
  ["A", "D", "E", "E"]], "ABCESEEEFS"))

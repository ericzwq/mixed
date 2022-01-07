class Trie {
  constructor() {
    this.pass = 0
    this.end = 0
    this.nexts = new Map()
  }

  static buildTrie(strs, trie = new Trie()) { // 字符串数组
    let cur, parent
    strs.forEach(i => {
      cur = trie
      parent = trie
      cur.pass++
      for (let s of i) {
        cur = parent.nexts.get(s)
        if (!cur) {
          cur = new Trie()
          parent.nexts.set(s, cur)
        }
        cur.pass++
        parent = cur
      }
      cur.end++
    })
    return trie
  }

  getPrefixNum(str) { // 匹配字符串前缀个数
    let cur = this
    for (let s of str) if (!(cur = cur.nexts.get(s))) break
    return cur ? cur.pass : 0
  }

  getStringNum(str) { // 匹配完整字符串个数
    let cur = this
    for (let s of str) if (!(cur = cur.nexts.get(s))) break
    return cur ? cur.end : 0
  }

  insert(strs) {
    return Trie.buildTrie(strs, this)
  }

  deleteString(str) { // 删除完整字符串
    if (!this.getStringNum(str)) return false
    let cur = this, parent = this
    cur.pass--
    for (let s of str) {
      parent = cur
      cur = cur.nexts.get(s)
      cur.pass--
      if (!cur.pass) {
        parent.nexts.delete(s)
        break
      }
    }
    cur.end--
    return true
  }

  deletePrefix(str) { // 删除字符串前缀
    if (!this.getPrefixNum(str)) return false
    let cur = this, parent = this
    for (let s of str) {
      parent = cur
      let node = cur.nexts.get(s)
      cur = node
      node.pass--
      if (!node.pass) {
        parent.nexts.delete(s)
        break
      }
    }
    cur.end--
    if (!cur.end) parent.nexts.delete(str[str.length - 1])
    return true
  }
}

class Trie2 { // 另一种设计
  constructor() {
    this.head = new Map()
  }

  insert(str) {
    let node = this.head
    for (let s of str) {
      if (!node.get(s)) node.set(s, new Map())
      node = node.get(s)
      node.pass = (node.pass || 0) + 1
    }
    node.end = (node.end || 0) + 1
  }
}

let strs = ['abc', 'abd', 'ab', '', 'bcddsdf']

let trie = Trie.buildTrie(strs)
console.log(trie.getPrefixNum('b'))
trie.insert(['d', 'e', 'ff'])
console.log(trie.deletePrefix('ff'));
trie.deletePrefix('')
console.log(trie)

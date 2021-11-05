function compilerToObj(html) {
  return html.match(/<(\S+)(\s+\S+\s*=\s*".+")*\s*>/)
}

console.log(compilerToObj(` <div  :id ="'dv' + 3" :class= "['now', a = '1' ? 'a' : '>' ]"> div 2</div> `));

function makeMap(arr) {
  let map = {}
  arr.forEach(i => map[i] = 1)
  return map
}

parseXml2()

function parseXml2(str) {
  str = ` <div   :id ="'dv' + 3" :class= "['now', a = '1' ? 'a' : '>' ]"> &nbsp; div 2 <br style="color: red"/><br /> <br/> </div> `
  let pairMap = {
      // '(': ')',
      // '[': ']',
      // '{': '}',
    },
    pairStack = [],
    syntax = [],
    quotes = [],
    tags = [],
    // subSyntax = [],
    dynamicMap = makeMap(['v', ':', '@', '#']),
    temp = '', // 缓存待确认字符串
    // subTemp = '',
    status = 'init' // init初始状态，word词（空格分割），string引号包裹的，symbol符号（=），keyword（关键词）
  ;
  // debugger
  for (let i = 0, len = str.length; i < len; i++) {
    let item = str[i]
    if (/\S/.test(item)) { //
      temp += item
      if (status === 'init') status = 'word'
    } else if (/\s/.test(item)) { // 空格
      if (status === 'word') {
        syntax.push({type: 'word', value: temp})
        setInit()
      } else if (status === 'string') {
        temp += item
      } else if (status === 'keyword') {
        syntax.push({type: 'keyword', value: temp})
        tags.push(temp)
        setInit()
      }
    } /*else if (item === '/') {
      if (status === 'keyword') {

      } else {

      }
    }*/ else if (item === '<') { // <br / >1</br><div></div>   img hr br input
      if (status === 'init') {
        temp += item
        if (!/[a-zA-Z]/.test(str[i++])) { // 非正确标签 < div>

        }
        for (; i < len; i++) {
          let _item = str[i]
          switch (_item) {
            case '<':
              break
            case '>':
              break
            case '"':
            case "'":
              break
            case '/':
              break
            default:

          }
        }
        pairStack.push(item)
        status = 'keyword'
      } else if (status === 'word') {

      } else if (status === 'keyword') {

      } else {
        temp += item
      }
    } else if (item === '>') { // 断开><
      if (status === 'word') { // <br/><br/>
        temp += item
        syntax.push({type: 'word', value: temp})
        setInit()
      } else if (status === 'init') {
        temp += item
        syntax.push({type: 'word', value: temp})
        setInit()
      }
    } else if (/['"]/.test(item)) { //
      if (status === 'init') { // a = "1"
        quotes.push(item)
        status = 'string'
      } else if (status === 'word') { // a ="1"
        syntax.push({type: 'word', value: temp})
        temp = ''
        quotes.push(item)
        status = 'string'
      } else if (status === 'string') {
        let symbol = quotes[quotes.length - 1]
        if (symbol === item) { // 一对引号内容匹配完
          quotes.pop()
          if (quotes.length) { // 引号中有子引号 " '' "
            temp += item
            // subTemp += item
            // subSyntax.push({type: 'string', value: subTemp})
            // subTemp = ''
          } else { // " "
            syntax.push({type: 'string', value: temp})
            setInit()
          }
        } else {
          temp += item
        }
      }
    } else if (item === '=') { //
      if (status === 'init') {
        temp += item
        syntax.push({type: 'symbol', value: temp})
        temp = ''
      } else if (status === 'word') {
        syntax.push({type: 'word', value: temp})
        syntax.push({type: 'symbol', value: item})
        setInit()
      } else { // 引号里有等号："a=1"
        temp += item
      }
    }
    // console.log({syntax, temp, quotes})
  }
  console.log({syntax, temp, quotes, tags})
  console.log({str})

  function setInit() {
    temp = ''
    // subSyntax = []
    status = 'init'
  }

  return syntax
}

function parseXml(str) {
  str = ` <div   :id ="'dv' + 3" :class= "['now', a = '1' ? 'a' : '>' ]"> &nbsp; div 2 <br style="color: red"/><br /> <br/> </div> `
  let pairMap = {
      // '(': ')',
      // '[': ']',
      // '{': '}',
    },
    pairStack = [],
    syntax = [],
    quotes = [],
    tags = [],
    // subSyntax = [],
    dynamicMap = makeMap(['v', ':', '@', '#']),
    temp = '', // 缓存待确认字符串
    // subTemp = '',
    status = 'init' // init初始状态，word词（空格分割），string引号包裹的，symbol符号（=），keyword（关键词）
  ;
  // debugger
  for (let i = 0, len = str.length; i < len; i++) {
    let item = str[i]
    if (/\S/.test(item)) { //
      temp += item
      if (status === 'init') status = 'word'
    } else if (/\s/.test(item)) { // 空格
      if (status === 'word') {
        syntax.push({type: 'word', value: temp})
        setInit()
      } else if (status === 'string') {
        temp += item
      } else if (status === 'keyword') {
        syntax.push({type: 'keyword', value: temp})
        tags.push(temp)
        setInit()
      }
    } /*else if (item === '/') {
      if (status === 'keyword') {

      } else {

      }
    }*/ else if (item === '<') { // <br / >1</br><div></div>
      if (status === 'init') {
        temp += item
        pairStack.push(item)
        status = 'keyword'
      } else if (status === 'word') {

      } else if (status === 'keyword') {

      } else {
        temp += item
      }
    } else if (item === '>') { // 断开><
      if (status === 'word') { // <br/><br/>
        temp += item
        syntax.push({type: 'word', value: temp})
        setInit()
      } else if (status === 'init') {
        temp += item
        syntax.push({type: 'word', value: temp})
        setInit()
      }
    } else if (/['"]/.test(item)) { //
      if (status === 'init') { // a = "1"
        quotes.push(item)
        status = 'string'
      } else if (status === 'word') { // a ="1"
        syntax.push({type: 'word', value: temp})
        temp = ''
        quotes.push(item)
        status = 'string'
      } else if (status === 'string') {
        let symbol = quotes[quotes.length - 1]
        if (symbol === item) { // 一对引号内容匹配完
          quotes.pop()
          if (quotes.length) { // 引号中有子引号 " '' "
            temp += item
            // subTemp += item
            // subSyntax.push({type: 'string', value: subTemp})
            // subTemp = ''
          } else { // " "
            syntax.push({type: 'string', value: temp})
            setInit()
          }
        } else {
          temp += item
        }
      }
    } else if (item === '=') { //
      if (status === 'init') {
        temp += item
        syntax.push({type: 'symbol', value: temp})
        temp = ''
      } else if (status === 'word') {
        syntax.push({type: 'word', value: temp})
        syntax.push({type: 'symbol', value: item})
        setInit()
      } else { // 引号里有等号："a=1"
        temp += item
      }
    }
    // console.log({syntax, temp, quotes})
  }
  console.log({syntax, temp, quotes, tags})
  console.log({str})

  function setInit() {
    temp = ''
    // subSyntax = []
    status = 'init'
  }

  return syntax
}

function parseAttrbutes() {
  let str = `:class = "['now', a = '1' ? 'a' : '' ]"`
  let stack = []
  let startIdx = -1
  let start
  const map = {
    '"': 1,
    "'": 1
  }
  for (let i = 0, len = str.length; i < len; i++) {
    let item = str[i]
    if (startIdx === -1 && map[item]) startIdx = i, start = item
    else if (start === item) {
      console.log(str.slice(startIdx, i + 1))
      break
    }
  }
  if (stack.length) throw '解析异常'
}

// console.log(parseAttrbutes())
// function makeMap(str, expectsLowerCase) {
//   const map = Object.create(null)
//   const list = str.split(',')
//   for (let i = 0; i < list.length; i++) {
//     map[list[i]] = true
//   }
//   return expectsLowerCase ? val => map[val.toLowerCase()] : val => map[val]
// }
//
// const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
// const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
// const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeRegExp.source}]*`
// const qnameCapture = `((?:${ncname}\\:)?${ncname})`
// const startTagOpen = new RegExp(`^<${qnameCapture}`)
// const startTagClose = /^\s*(\/?)>/
// const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
// const doctype = /^<!DOCTYPE [^>]+>/i
// // #7298: escape - to avoid being passed as HTML comment when inlined in page
// const comment = /^<!\--/
// const conditionalComment = /^<!\[/

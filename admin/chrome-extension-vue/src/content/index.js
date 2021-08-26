console.log(chrome, 'content', Date.now())
import {createEcharts} from "./shopee";
// 发现element的字体文件无法通过打包加载，所以另外通过cdn来加载样式
let element_css = document.createElement('link');
element_css.href = 'https://unpkg.com/element-ui@2.8.2/lib/theme-chalk/index.css'
element_css.rel = "stylesheet"
document.head.append(element_css)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => { // { id: 'sdfasdf' }
  if (!request.onloaded) return
  console.log(request, sender, sendResponse)
  console.log('content 接收到页面加载完成')
  console.log(document.querySelector('.shopee__fo0dKsgoukkfcaik'))
  let arr = ['shopee.com.my', 'shopee.co.id', 'shopee.co.th', 'shopee.ph', 'xiapi.xiapibuy.com', 'shopee.sg', 'shopee.vn', 'shopee.com.br']
  let newArr = ['my.xiapibuy.com', 'id.xiapibuy.com', 'th.xiapibuy.com', 'ph.xiapibuy.com', 'xiapi.xiapibuy.com', 'sg.xiapibuy.com', 'vn.xiapibuy.com', 'br.xiapibuy.com']
  let country
  arr.forEach((item, idx) => {
    if (location.href.indexOf(item) > -1 || location.href.indexOf(newArr[idx]) > -1) {
      country = ++idx
    }
  })
  let res = location.href.match(/-i\.(\d+)\.(\d+)$/)
  if (!res) return console.log('获取商品id失败')
  let pid = res[2]
  if (!country) return console.log('no match country')
  setTimeout(() => {
    createEcharts()
    chrome.runtime.sendMessage(sender.id, {
      shopeeListInfo: true, params: {country, pid}
    })
  }, 500)
})
// MessageBox.alert('这是一段内容', '标题名称', {
//   confirmButtonText: '确定', callback: action => {
//     Message({type: 'info', message: `action: ${action}`});
//   }
// })

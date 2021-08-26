import http from '../common/http'
console.log(chrome, 'background', Date.now())
chrome.tabs.query({}, function (res) {
  console.log(res, chrome.runtime.getURL('index.js'))
  // chrome.tabs.update(res[11].id, { url: 'www.baidu.com'})
})
chrome.tabs.onUpdated.addListener(function (tabId, info) {
  console.log(tabId, info, arguments)

  // 事件过滤页面
  // chrome.webNavigation.onCompleted.addListener(function() {
  //   console.log("This is my favorite website!");
  // }, {url: [{urlMatches : 'https://www.baidu.com/'}]});
  if (info.status !== 'complete') return
  console.log('页面加载完成')
  chrome.tabs.sendMessage(tabId, {onloaded: true})
  // chrome.storage.local.sync.set({k: 1})
  // chrome.storage.local.get(['haiying_token', 'refresh_token'], function (result) {
  //   console.log(result)
  // })
  chrome.runtime.onMessage.addListener((request, sender) => { // { id: 'sdfsdfas', tab: {} }
    console.log(request, sender, sender.id)
    if (request.shopeeListInfo) {
      getEchartsData(request.params, sender)
    }
  })
})

function getEchartsData(data, sender) {
  let data2 = {
    "otherDate": ["2021-04-14", "2021-04-17", "2021-05-25", "2021-05-28", "2021-05-29", "2021-05-30", "2021-05-31", "2021-06-01", "2021-06-05", "2021-06-06", "2021-06-09", "2021-06-11", "2021-06-13", "2021-06-16", "2021-06-18", "2021-06-21", "2021-06-26", "2021-06-30", "2021-07-01", "2021-07-05", "2021-07-06", "2021-07-08"],
    "mixPriceArray": [0.30, 0.30, 0.30, 0.30, 0.30, 0.30, 0.30, 0.30, 0.30, 0.41, 0.32, 0.41, 0.49, 0.49, 0.49, 0.45, 0.30, 0.30, 0.30, 0.27, 0.27, 0.49],
    "view": [21286, 21211, 21118, 21395, 21950, 22310, 22503, 22652, 26660, 28058, 30477, 31506, 32389, 31912, 32439, 30881, 28315, 27496, 25830, 20575, 19031, 18764],
    "ratingsArray": [30216, 30337, 31282, 31380, 31412, 31419, 31437, 31452, 31526, 31550, 31642, 31678, 31708, 31732, 31738, 31747, 31803, 31825, 31829, 31841, 31843, 31851],
    "historicalSold": [1879319, 1888569, 1961900, 1968095, 1969452, 1970622, 1971456, 1972069, 1974096, 1975007, 1977125, 1977992, 1978755, 1979901, 1979964, 1980038, 1981653, 1982312, 1982435, 1982719, 1982745, 1982835],
    "favoriteArray": [16113, 16147, 16472, 16526, 16543, 16548, 16560, 16571, 16647, 16669, 16698, 16705, 16725, 16723, 16741, 16739, 16745, 16738, 16742, 16735, 16735, 16744],
    "stock": [156380, 140148, 53253, 47743, 46159, 45361, 44213, 43313, 33481, 30656, 25648, 25605, 25400, 25277, 25199, 44744, 29062, 28653, 28399, 27989, 27620, 15],
    "minPriceArray": [0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.30, 0.29, 0.32, 0.41, 0.49, 0.49, 0.49, 0.45, 0.30, 0.30, 0.30, 0.27, 0.27, 0.49]
  }
  chrome.storage.local.get(['haiying_token', 'hy_loginDate', 'refresh_token'], function (res) {
    if (!res['haiying_token']) return console.log('no token')
    let token = res['haiying_token']
    http({
      url: '/shopee/craw/product/detail',
      method: 'post',
      data,
      headers: {
        token
      },
    }).then(r => {
      let data = r?.data?.other || data2
      chrome.tabs.sendMessage(sender.tab.id, {
        data, hasChartData: true
      })
    })
  })
}

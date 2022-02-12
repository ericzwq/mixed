import Fetch from "../src";

console.dir(Fetch)

// cancel request, A controller can only correspond to one request
// const controller = new AbortController()
// Fetch.get('/', {}, {timeout: 1000, controller})
// controller.abort()

// set timeout and Content-Type
// Fetch.get('/', {}, {
//   timeout: 1,
//   headers: {
//     'Content-Type': 'application/x-www-form-urlencoded'
//   }
// })

// If params is provided, it will be parsed as URLSearchParams spliced to the request address, just like passing parameters in GET mode.
// Fetch.post('http://wanqiang.top:3000', {data: {a: 2}, params: {p: 1}}) // expected request url: http://wanqiang.top:3000/?p=1

// If data is an object or array, the Content-Type will be set application/json, and data will be converted to String type, other Content-Type that are judged by default for fetch.
// Fetch.post('http://wanqiang.top:3000', {data: {a: 2}}) // expected Content-Type: application/json
// Fetch.post('http://wanqiang.top:3000', {data: [1, 2]}) // expected Content-Type: application/json
// Fetch.post('http://wanqiang.top:3000', {data: 'a=2'}) // expected Content-Type: text/plain
// Fetch.post('http://wanqiang.top:3000', {data: new URLSearchParams({a: 2})}) // expected Content-Type: application/x-www-form-urlencoded
// Fetch.post('http://wanqiang.top:3000', {data: new FormData()}) // expected Content-Type: multipart/form-data

// base url
// Fetch.config.base = 'http://wanqiang.top:3000'
// Fetch.post('/url', {data: {a: 2}}) // expected request url: http://wanqiang.top:3000/url

// If you provide a full url, it will not be spliced with base
// Fetch.config.base = 'http://wanqiang.top:3000'
// Fetch.post('http://other.com/url', {data: {a: 2}}) // expected request url: http://other.com/url

Fetch('http://wanqiang.top:3000', {data: undefined},
  {
    responseType: 'text',
    headers: {Authorization: '5'},
    // mode: 'no-cors'
    onDownloadProgress(progress) {
      console.log(progress)
    }
  })
  .then(r => console.log(r), e => console.log(e))

const http = require('http')
const http2 = require('http2')
const https = require('https')
const fs = require('fs')
const multiparty = require('multiparty')
const server = http.createServer()
const httpsOption = {
  key: fs.readFileSync('./https/6414388_www.wanqiang.top.key'),
  cert: fs.readFileSync('./https/6414388_www.wanqiang.top.pem')
}
const server2 = http2.createSecureServer(httpsOption)
const httpsServer = https.createServer(httpsOption)

function setCORSHeader(res) {
  //设置允许跨域的域名，*代表允许任意域名跨域
  // res.setHeader("Access-Control-Allow-Origin", "http://localhost");
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Credentials', true)
  //允许的header类型
  res.setHeader('Access-Control-Allow-Headers', 'content-type,Authorization')//加Authorization防止跨域
  //跨域允许的请求方式
  res.setHeader('Access-Control-Allow-Methods', 'DELETE,PUT,POST,GET,OPTIONS,PATCH')
}

function setCookieHeader(res) {
  // Path=/; Expires=Thu, 29 Sep 2022 03:09:20 GMT; Domain= 127.0.0.1;
  res.setHeader('Set-Cookie', [
    'cookie0=test; Domain=wanqiang.top;',
    'cookie00=test; Path=/; Domain=wanqiang.top;',
    'cookie1=test222; SameSite=None; Secure;', // 可跨顶级域
    'cookie11=test; SameSite=Lax;',
    'cookie12=test; SameSite=Strict;',
    'cookie13=test; SameSite=Lax; Secure;',
    'cookie14=test; SameSite=Strict; Secure;',
    'cookie2=test; SameSite=None; Secure; Domain=localhost;',
    'cookie3=test; SameSite=None; Secure; Domain=127.0.0.1;',
    'cookie31=test; SameSite=Lax; Domain=127.0.0.1;',
    'cookie21=test; SameSite=None; Domain=wanqiang.top; Secure',
    // 'cookie4=test; SameSite=None; Secure; Domain=www.test.com;',
    // 'cookie6=test; SameSite=None; Secure; Domain=.test.com;',
    // 'cookie7=test; Domain=.test.com;'
  ])
}

server.on('request', function (req, res) {
  if (req.method === 'OPTIONS') {
    console.error('options')
    setCORSHeader(res)
    return res.end()
  }
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    return new multiparty.Form().parse(req, (err, fields, files) => {
      console.log({err, fields, files})
      res.end()
    })
  }
  req.on('data', function (chunk) {
    console.log('data', chunk, chunk.toString())
  })
  // req.on('end', function () {
  //   console.log('end', arguments.length)
  // })
  let url = req.url.split('?')[0]
  console.log(`-----${req.url}--------http------${req.method}-------`)
  console.log(req.headers)
  setCORSHeader(res)
//  setCookieHeader(res)

//   const readStream = fs.createReadStream('./video.mp4')
  // readStream.pipe(res)
  // res.setHeader('Content-Type', 'application/json;charset=UTF-8;')
  // res.statusCode = 403
//  res.end('{"ok": "true对的对的对的对的"}')
  // res.end('a=2')
//  res.write(readStream)

  fs.readFile('./cookie-test.html', (err, data) => {
    if (err) return console.log(err)
    // res.end(data)
    res.write(data, 'binary')
    // res.end('{ "ok": true}')
    res.end()
  })
  // if (url == '/index.html' || url == '/login.html' || url == '/category.html') {
  //   res.write('<h1>' + url + '</h1>');
  // } else {
  //   res.write('<h1>Sorry! It is not find.</h1>');
  // }
  // res.end('a');
})
server2.on('request', function (req, res) {
  setCORSHeader(res)
  console.log(`-----${req.url}--------http------${req.method}-------`)
  req.on('data', chunk => console.log('data', chunk.toString()))
  res.end('http2')
})
server2.on('stream', function (stream, headers) {
  console.log(stream.read())
})
httpsServer.on('request', function (req, res) {
  setCORSHeader(res)
  setCookieHeader(res)
  console.log(req.headers, '\n-------------https-------------')
  console.log(req.headers['x-forwarded-for'])
  fs.readFile('./cookie-test.html', (err, data) => {
    if (err) return console.log(err)
    // res.end(data)
    res.write(data, 'binary')
    // res.end('{ "ok": true}')
    res.end()
  })
//  res.end('https')
})

server.listen(3000, 'wanqiang.top', function () {
  console.log('http started: 3000')
})

//server2.listen(5000, 'wanqiang.top', function () {
//  console.log('http2 started 5000')
//})

httpsServer.listen(4000, 'wanqiang.top', function () { // 需配置本地vhost文件
  console.log('https started: 4000')
})
// fetch('http://wanqiang.top:3000', {body: JSON.stringify({a: 1}), method: 'put'})

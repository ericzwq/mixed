let fs = require('fs')
let path = require('path')
console.log(fs.createWriteAppendStream)
let readStream = fs.createReadStream(path.resolve(__dirname, 'test.html'))
readStream.setEncoding('utf8')
let writeStream = fs.createWriteStream(path.resolve(__dirname, '2test.html'))
readStream.on('data', chunk => {
  // console.log(chunk, 6)
  writeStream.write(chunk, 'utf8')
})
console.log(path.resolve('/a', '../test.html'), path.join('a', 'test.html'), 9)
readStream.on('end', function () {
  console.log(arguments)
})

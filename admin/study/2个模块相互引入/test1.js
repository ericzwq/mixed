console.log('test1')
module.exports.test1 = 'test111'
let {test2} = require('./test2')
console.log(test2)
module.exports.test1 = 'test1'

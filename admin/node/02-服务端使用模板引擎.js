var fs = require('fs');
var tpl = require('art-template');
fs.readFile('02-模板.html', function (err, data) {
    var ret = tpl.render(data.toString(), {name: '张三', age: 14, province: '北京', sex: '男'});
    console.log(ret);
});
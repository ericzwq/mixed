var url = require('url');
var data = {name: 'ss', age: 34, gender: 1};
require('http').createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost')
    let {pathname, query} = url.parse(req.url, true);
    console.log(pathname)
    if (pathname === '/') {
        console.log(1)
        res.end('1')
    } else if (pathname === '/jsonp') {
        res.end(query.callback + '(' + JSON.stringify(data) + ')');
    } else {
        res.end('404');
    }
}).listen(3000, function () {
    console.log('success...')
});
var http = require('http');
var server = http.createServer();
server.on('request', function (req, res) {
    var url = req.url.split('?')[0];
    console.log(url);
    if (url == '/layout.html' || url == '/login.html' || url == '/category.html') {
        res.write('<h1>' + url + '</h1>');
    } else {
        res.write('<h1>Sorry! It is not find.</h1>');
    }
    res.end('a');
});
server.listen(3000, function () {
    console.log('start successful')
});
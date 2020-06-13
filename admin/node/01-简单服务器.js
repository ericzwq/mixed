var http = require('http');
var server = http.createServer();
server.on('request', function (req, res) {
    var url = req.url.split('?')[0];
    console.log(url);
<<<<<<< HEAD
    if (url == '/layout.html' || url == '/login.html' || url == '/category.html') {
=======
    if (url == '/index.html' || url == '/login.html' || url == '/category.html') {
>>>>>>> 362e22225c41d4ceb7e44a4b3cdeb8697e6d35e7
        res.write('<h1>' + url + '</h1>');
    } else {
        res.write('<h1>Sorry! It is not find.</h1>');
    }
    res.end('a');
});
server.listen(3000, function () {
    console.log('start successful')
});
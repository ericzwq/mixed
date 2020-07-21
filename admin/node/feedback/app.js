var tpl = require('art-template');
var fs = require('fs');
var url = require('url');
var comments = [
    {
        name: '李规划1',
        message: '我真帅',
        time: '34343-34-34'
    },
    {
        name: '李规划2',
        message: '我真帅',
        time: '34343-34-34'
    },
    {
        name: '李规划3',
        message: '我真帅',
        time: '34343-34-34'
    },
    {
        name: '李规划4',
        message: '我真帅',
        time: '34343-34-34'
    }
];
require('http').createServer(function (req, res) {
    var parseUrl = url.parse(req.url, true);
// <<<<<<< HEAD
//     console.log(parseUrl)
// =======
// >>>>>>> 362e22225c41d4ceb7e44a4b3cdeb8697e6d35e7
    var path = parseUrl.pathname;
    var query = parseUrl.query;
    if (path === '/') {

// <<<<<<< HEAD
//         fs.readFile('./views/layout.html', function (err, data) {
// =======
        fs.readFile('./views/index.html', function (err, data) {
// >>>>>>> 362e22225c41d4ceb7e44a4b3cdeb8697e6d35e7
            if (err) res.end('busy');
            var s = tpl.render(data.toString(), {data: comments});
            res.end(s);
        })
    } else if (path.indexOf('/public/') === 0) {
        fs.readFile('.' + req.url, function (err, data) {
            if (err) {
                res.end('not found');
                return false
            }
            res.end(data.toString())
        })
    } else if (path === '/post') {
        fs.readFile('views/post.html', function (err, data) {
            if (err) {
                res.end('busy');
                return false;
            }
            res.end(data.toString());
        })
    } else if (path === '/comments') {
        if (JSON.stringify(query) !== '{}') {
            comments.push({name: query.name, message: query.message, time: Date.now()});
        }
        //重定向 302为临时重定向 301永久重定向
        res.statusCode = 302;
        res.setHeader('Location', '/');
        res.end();
    } else {
        fs.readFile('views/404.html', function (err, data) {
            if (err) {
                res.end('404 busy');
                return false;
            }
            res.end(data.toString());
        })
    }
}).listen(3000, function () {
    console.log('success')
});
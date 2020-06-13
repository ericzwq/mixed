var express = require('express');
var bodyParser = require('body-parser');
var app = express();
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
// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })
// POST /login gets urlencoded bodies
app.post('/comments', urlencodedParser, function (req, res) {
    let comment = req.body;
    comment.time = Date.now();
    comments.unshift(comment);
    res.redirect('/');
})

// POST /api/users gets JSON bodies
// app.post('/api/users', jsonParser, function (req, res) {
//     // create user in req.body
// })
app.engine('html', require('express-art-template'));
app.use('/public/', express.static('./public/'))
app.get('/', function (req, res) {
    res.render('layout.html', {data: comments});
}).get('/post', function (req, res) {
    res.render('post.html');
}).get('/comments', function (req, res) {
    var comment = req.query;
    comment.time = Date.now();
    comments.unshift(comment);
    res.redirect('/');
    res.end();
}).listen(3000, function () {
    console.log('success...')
});
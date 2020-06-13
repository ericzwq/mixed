var express = require('express');
var router = require('./router');
var app = express();
app.use(router);
app.engine('html', require('express-art-template'));
app.listen(3000, function () {
    console.log('start...')
})
var express = require('express');
var bodyParser = require('body-parser');
var router = require('./routers/router');
var session = require('express-session');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.engine('html', require('express-art-template'));
app.use('/node_modules/', express.static('../node_modules/'));
app.use('/public/', express.static('./public/'));
app.use(session({
    secret:"dsafsafsf",		//设置签名秘钥  内容可以任意填写
    cookie:{maxAge:300*1000},		//设置cookie的过期时间，例：80s后session和相应的cookie失效过期
    resave:true,			//强制保存，如果session没有被修改也要重新保存
    saveUninitialized:false		//如果原先没有session那么久设置，否则不设置
}));
app.use(router)
app.listen(3000, function () {
    console.log('success...')
})
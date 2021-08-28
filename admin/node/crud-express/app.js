var express = require('express');
var router = require('./router');
var app = express();
app.all("*", function (req, res, next) {
    //设置允许跨域的域名，*代表允许任意域名跨域
    res.header("Access-Control-Allow-Origin", "https://www.amazon.com");
    //允许的header类型
    res.header("Access-Control-Allow-Credentials", true)
    res.header("Access-Control-Allow-Headers", "content-type,Authorization,level,id,name,X-Refresh-Token,token");//加Authorization防止跨域
    //跨域允许的请求方式
    res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
    if (req.method.toLowerCase() === 'options')
        res.sendStatus(200);  //让options尝试请求快速结束
    else
        next();
})
app.use(router);
app.engine('html', require('express-art-template'));
app.listen(3000, function () {
    console.log('start...')
})

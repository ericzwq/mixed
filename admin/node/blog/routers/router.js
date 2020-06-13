var express = require('express');
var User = require('../modals/user');
var Query = require('../modals/query');
var router = express.Router();
router.get('/', function (req, res) {
    res.render('index.html', {user: req.session.user});
});
router.get('/login', function (req, res) {
    res.render('login.html');
});
router.post('/login', function (req, res) {
    var login = req.body;
    res.data = {};
    Query.find({email: login.email, password: login.password}, function (err, data) {
        if (err) {
            console.log('查询失败')
            res.data.err_code = 500;
        } else {
            if (data.length) {
                res.data.err_code = 0;
                console.log('用户' + login.email + '登录成功');
                req.session.user = data[0];
                res.end(JSON.stringify(res.data));
            } else {
                res.data.err_code = 1;
                res.end(JSON.stringify(res.data));
            }
        }
    })
});
router.get('/register', function (req, res) {
    res.render('register.html');
});
router.post('/register', function (req, res) {
    var register = req.body;
    res.data = {};
    var user = new User({email: register.email, nickname: register.nickname, password: register.password});
    new Promise(function (resolve, reject) {
        User.find({
            email: register.email
        }, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    }).then(function (data) {
        res.data.err_code = data.length === 0 ? 0 : 1;
        if (res.data.err_code === 1) {
            res.end(JSON.stringify(res.data));
            return false;
        } else {
            return new Promise(function (resolve, reject) {
                User.find({
                    nickname: register.nickname
                }, function (err, data) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            }).then(function (data) {
                res.data.err_code = data.length === 0 ? 0 : 2;
                if (res.data.err_code === 2) {
                    res.end(JSON.stringify(res.data));
                    return false;
                } else {
                    return new Promise(function (resolve, reject) {
                        user.save(function (err, data) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(data);
                            }
                        });
                    }).then(function (data) {
                        console.log('数据添加成功');
                        res.data.err_code = 0;
                        res.end(JSON.stringify(res.data));
                    }, function (err) {
                        res.data.err_code = 500;
                        console.log(err + '数据添加失败');
                    });
                }
            }, function (err) {
                res.data.err_code = 500;
                console.log(err + '查询昵称失败');
            });
        }
    }, function (err) {
        res.data.err_code = 500;
        console.log(err + '查询邮箱失败');
    });
});
router.get('/logout', function (req, res) {
    req.session.user = null;
    console.log(req.session)
    res.redirect('/login');
});
module.exports = router;
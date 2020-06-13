var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/blog');
var Schema = mongoose.Schema;
var schema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    nickname: {
        type: String,
        required: true
    },
    created_time: {
        type: Date,
        default: Date.now
    },
    last_update_time: {
        type: Date,
        default: Date.now
    },
    avatar: {
        type: String,
        default: '/public/img/avatar-default.png'
    },
    bio: {
        //个人信息
        type: String,
        default: ''
    },
    gender: {
        type: Number,
        menu: [-1, 0, 1],//保密，女，男
        default: -1
    },
    birthday: {
        type: Date,
    },
    status: {
        type: Number,
        menu: [0, 1, 2], //无限制，不能评论，不能登录
        default: 0
    }
});
module.exports = mongoose.model('User', schema);
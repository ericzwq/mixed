$(function () {
    var returnUrl = location.search.replace('?returnUrl=', '');
    if (!returnUrl) returnUrl = LT.userIndexUrl;
    $('.lo_confirm').on('tap', function () {
        var data = LT.getUrlParams($('main form').serialize());
        if (!data.username) {
            mui.toast('请输入用户名');
            return false;
        }
        if (!data.password) {
            mui.toast('请输入密码');
            return false;
        }
        $.ajax({
            url: '/user/login',
            type: 'post',
            data: {username: data.username, password: data.password},
            success: function (data) {
                console.log(data);
                if (data.error == 403) {
                    mui.toast(data.message);
                    return false;
                }
                if (data.success == true) {
                    mui.toast('登录成功');
                    setTimeout(function () {
                        location.href = returnUrl;
                    }, 1000);
                }
            }
        })
    });
    $('.lo_cancel').on('tap', function () {
        location.href = returnUrl;
    });
});
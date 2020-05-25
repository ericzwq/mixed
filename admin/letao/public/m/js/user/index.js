$(function () {
    LT.loginAjax({
        url: '/user/queryUserMessage',
        type: 'get',
        data: '',
        dataType: 'json',
    }, function (data) {
        $('.user_info').html(template('userTemp', data))
        $('.user_logout').on('tap', function () {
            $.ajax({
                url: '/user/logout',
                data: '',
                type: 'get',
                dataType: 'json',
                success: function (data) {
                    if (data.success == true) {
                        mui.toast('欢迎您再回来');
                        setTimeout(function () {
                            location.href = LT.userLoginUrl;
                        }, 1000);
                    } else {
                        mui.toast('服务繁忙');
                    }
                }
            })
        });
    });
});
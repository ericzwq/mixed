$(function () {
    var $form = $('form');
    $form.bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            username: {
                message: '用户名验证失败',
                validators: {
                    notEmpty: {
                        message: '用户名不能为空'
                    },
                    callback: {
                        message: '用户名不存在'
                    }
                }
            },
            password: {
                validators: {
                    stringLength: {
                        min: 6,
                        max: 18,
                        message: '密码长度为6-18位'
                    },
                    callback: {
                        message: '密码错误'
                    }
                }
            }
        }
    });
    $('button[type=submit]').on('click', function (e) {
        var params = {};
        e.preventDefault();
        var splitArr = $form.serialize().split('&');
        splitArr.forEach(function (item) {
            var itemArr = item.split('=');
            params[itemArr[0]] = itemArr[1];
        });
        $.ajax({
            url: '/employee/employeeLogin',
            data: params,
            type: 'post',
            dataType: 'json',
            success: function (data) {
                if (data.success && data.success == true) {
                    location.href = BE.indexUrl;
                } else if (data.error) {
                    if (data.error == 1000) {
                        $form.data('bootstrapValidator').updateStatus('username', 'INVALID', 'callback');
                    } else if (data.error == 1001) {
                        $form.data('bootstrapValidator').updateStatus('password', 'INVALID', 'callback');
                    }
                } else {
                    BE.error.show();
                }
            }
        })
    });
});
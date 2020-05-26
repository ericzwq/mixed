$(function () {
    var userData = {};
    var $modal = $('.user_modal');
    var pageSize = 3;
    getUserData(function (data) {
        BE.validData(data, function () {
            $('.table tbody').append(template('userTemp', data));
            //修改用户
            $('tbody').on('click', 'a.btn', function () {
                var id = $(this).parent().siblings('td:first-of-type').text();
                var isDelete = $(this).text() == '禁用' ? 0 : 1;
                userData.id = id;
                userData.isDelete = isDelete;
                $('.modal-body strong:first-of-type').text(isDelete == 0 ? '禁用' : '启用');
                $('.modal-body strong:last-of-type').text(data.username);
                $modal.modal('show');
            });
            //分页
            BE.paginator($('#userPage'), sessionStorage.getItem('userCurrentPage') || 1, 5, Math.ceil(data.total / data.size), function (type, page, current) {
                sessionStorage.setItem('userCurrentPage', current);
                if (page == current) {
                    return "javascript:void(0)";
                } else {
                    getUserData(function (data) {
                        $('.table tbody').html(template('userTemp', data));
                    }, {page: current, pageSize: pageSize})
                }
            });
        },data.rows && data.rows.length);
    });
    //点确定按钮
    $('button.y').on('click', function () {
        $.ajax({
            url: '/user/updateUser',
            type: 'post',
            dataType: 'json',
            data: userData,
            success: function (data) {
                $modal.modal('hide');
                if (data.success && data.success == true) {
                    getUserData(function (data) {
                        $('.table tbody').html(template('userTemp', data));
                    })
                } else {
                    BE.error.show();
                }
            }
        })
    });

    function getUserData(callback, data = {page: sessionStorage.getItem('userCurrentPage') || 1, pageSize: pageSize}) {
        $.ajax({
            url: '/user/queryUser',
            type: 'get',
            data: data,
            dataType: 'json',
            success: function (data) {
                callback && callback(data);
            }
        });
    }
});
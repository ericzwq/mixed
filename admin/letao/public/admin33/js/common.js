var BE = {};
BE.indexUrl = '/admin33/index.html';
BE.loginUrl = '/admin33/login.html';
BE.productManageUrl = '/admin33/productManage.html';
BE.userManageUrl = '/admin33/userManage.html';
BE.firstCategoryUrl = '/admin33/firstCategory.html';
BE.secondCategoryUrl = '/admin33/secondCategory.html';
BE.error = $('#lt_error');
//进度条
$(window).ajaxStart(function () {
    NProgress.start();
});
$(window).ajaxComplete(function () {
    NProgress.done();
});
var modalHtml = ['<div class="modal fade">',
    '            <div class="modal-dialog" role="document">',
    '                <div class="modal-content">',
    '                    <div class="modal-header">',
    '                        <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>',
    '                        <h4 class="modal-title">温馨提示</h4>',
    '                    </div>',
    '                    <div class="modal-body">',
    '                        <p class="text-danger"><span class="glyphicon glyphicon-info-sign"></span> 您确定要提出吗？</p>',
    '                    </div>',
    '                    <div class="modal-footer">',
    '                        <button type="button" class="btn btn-default" data-dismiss="modal">取消</button>',
    '                        <button type="button" class="btn btn-primary">确定</button>',
    '                    </div>',
    '                </div>',
    '            </div>',
    '        </div>'].join("");
var errorHtml = ['<div class="alert alert-danger fade in">',
    '        <button type="button" class="close" data-dismiss="alert">&times;</button>',
    '        <strong class="">系统繁忙</strong>',
    '    </div>'].join("");
$('body').append(modalHtml);
BE.error.append(errorHtml);
$('.ind_user').on('click', function () {
    location.href = BE.userManageUrl;
});
$('.ind_cat').on('click', function () {
    $('.cat_child').toggle(300);
});
$('.ind_pro').on('click', function () {
    location.href = BE.productManageUrl;
});
$('.fi_cat').on('click', function () {
    location.href = BE.firstCategoryUrl;
});
$('.se_cat').on('click', function () {
    location.href = BE.secondCategoryUrl;
});
//模态框
$('#lt_exit').on('click', function () {
    var $modal = $('.modal');
    $modal.modal('show');
    $('button.btn-primary').on('click', function () {
        $.ajax({
            url: '/employee/employeeLogout',
            type: 'get',
            data: '',
            dataType: 'json',
            success: function (data) {
                if (data.success && data.success == true) {
                    $modal.modal('hide');
                    location.href = BE.loginUrl;
                } else {
                    BE.error.show();
                }
            }
        })
    });
});
BE.paginator = function ($element, currentPage = 1, numberOfPages = 5, totalPages = 1, callback) {
    var options = {
        bootstrapMajorVersion: 1,    //版本
        currentPage: currentPage,    //当前页数
        numberOfPages: numberOfPages,    //最多显示Page页
        totalPages: totalPages,    //所有数据可以显示的页数
        pageUrl: function (type, page, current) {
            callback && callback(type, page, current)//按钮作用 当前遍历页号 当前页数
        }
    };
    $element.bootstrapPaginator(options);
};
BE.validData = function (data, callback, express = data.success && (data.success = true)) {
    if (express) {
        callback && callback(data);
    } else {
        BE.error.show();
    }
};
// $.ajax({
//     url: '/employee/checkRootLogin',
//     type: 'get',
//     data: '',
//     dataType: 'json',
//     success: function (data) {
//         console.log(data)
//     }
// });

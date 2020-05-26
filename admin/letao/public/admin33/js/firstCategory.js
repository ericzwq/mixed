$(function () {
    var pageSize = 5;
    var $modal = $('.fiCa_modal');
    getFiCaData(function (data) {
        BE.validData(data, function (data) {
            $('.fc_tbody').html(template('fiCaTemp', data));
            BE.paginator($('#fiCaPage'), sessionStorage.getItem('fiCaCurrentPage') || 1, 5, Math.ceil(data.total / data.size), function (type, page, current) {
                sessionStorage.setItem('fiCaCurrentPage', current);
                if (page == current) {
                    return "javascript:void(0)";
                } else {
                    getFiCaData(function (data) {
                        $('.fc_tbody').html(template('fiCaTemp', data));
                    }, {page: current, pageSize: pageSize})
                }
            });
        }, data.rows && data.rows.length)
    });
    //点击添加
    $('.addCate').on('click', function () {
        $modal.modal('show');
    });
    //输入框校验
    var $form = $('.fiCaForm');
    $form.bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            firstCategory: {
                validators: {
                    notEmpty: {
                        message: '名称不能为空'
                    },
                    stringLength: {
                        max: 10,
                        min: 2,
                        message: '名称为2-10个字符'
                    }
                }
            }
        }
    });
        $form.on('success.form.bv',function (e) {
            var $inputV = $form.children('div').children('input').val();
            $.ajax({
                url: '/category/addTopCategory',
                type: 'post',
                data: {categoryName: $inputV},
                dataType: 'json',
                success: function (data) {
                    BE.validData(data, function () {
                        $modal.modal('hide');
                        getFiCaData(function () {
                            location.reload();
                        })
                    });
                }
            })
    });

    function getFiCaData(callback, data = {page: sessionStorage.getItem('fiCaCurrentPage') || 1, pageSize: pageSize}) {
        $.ajax({
            url: '/category/queryTopCategoryPaging',
            type: 'get',
            data: data,
            dataType: 'json',
            success: function (data) {
                callback && callback(data);
            }
        })
    }
});
$(function () {
    var $modal = $('.seCa_modal');
    var $form = $('.seCaForm');
    var $yes = $('.seCaY');
    getSeCaData({page: 1, pageSize: 5}, function (data) {
        $('.sc_tbody').html(template('seCaTemp', data));
    });
    getAllFiCaData({page: 1, pageSize: 1000}, function (data) {
        $('ul.dropdown-menu').append(template('fiCaSeTemp', data));
    });
    $('.addSeCate').on('click', function () {
        $modal.modal('show');
    });
    $form.bootstrapValidator({
        excluded: [],
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            categoryId: {
                validators: {
                    notEmpty: {
                        message: '请选择一级分类'
                    }
                },
            },
            brandName: {
                validators: {
                    notEmpty: {
                        message: '请输入二级分类名称'
                    },
                    stringLength: {
                        max: 6,
                        min: 2,
                        message: '二级分类名称长度为2-6'
                    }
                },
            },
            brandLogo: {
                validators: {
                    notEmpty: {
                        message: '请上传图片'
                    }
                }
            }
        }
    });
    $yes.on('click', function () {
        $form.on('success.form.bv', function () {
            console.log($(this).serialize());
            console.log({brandName: 11, categoryId: 2, isDelete: 1, brandLogo: $('.upImg img').attr('src'), hot: 1})
            $.ajax({
                url: '/category/addSecondCategory',
                type: 'post',
                contentType: false,
                processData: false,
                data: {brandName: 11, categoryId: 1, isDelete: 1, brandLogo: $('.upImg img').attr('src'), hot: '发发'},
                dataType: 'json',
                success: function (data) {
                    console.log(data)
                }
            });
        });
    });
    //一级分类
    $('ul.dropdown-menu').on('click', 'a', function () {
        var t = $(this).text();
        if (t) {
            $('.choose').text(t);
            $('input[name=categoryId]').val(t);
            $form.data('bootstrapValidator').updateStatus('categoryId', 'VALID')
        }
    });

    //上传图片
    $('.fileupload').fileupload({
        dataType: 'json',
        url: '/category/addSecondCategoryPic',
        done: function (e, data) {
            $('.upImg img').attr('src', data.result.picAddr);
            // $('input[name=brandLogo]').val(data.result.picAddr);
            $form.data('bootstrapValidator').updateStatus('brandLogo', 'VALID')
        }
    });

    function getSeCaData(data, callback) {
        $.ajax({
            url: '/category/querySecondCategoryPaging',
            type: 'get',
            data: data,
            dataType: 'json',
            success: function (data) {
                callback && callback(data);
            }
        })
    }

    function getAllFiCaData(data, callback) {
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
})
;
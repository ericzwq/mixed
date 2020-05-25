$(function () {
    window.data = {
        url: '/cart/queryCartPaging',
        type: 'get',
        dataType: 'json',
        data: {page: 1, pageSize: 100}
    };
    LT.loginAjax(window.data, function (data) {
        refresh();
        $('.cartList').html(template('cartTemp', data));
        $('.mui-slider-right').on('tap', function (e) {
            var $this = $(this);
            var proId = $(this).attr('data-id');
            data.data.forEach(function (item) {
                var proSizeArr = item.productSize.split('-');
                data.proSizeArr = proSizeArr;
                if (item.id == proId) data.pro = item;
            });
            if ($(e.target).hasClass('mui-icon-compose')) {
                //编辑
                var mask = mui.createMask();
                var tip = $('.cart_tip');
                tip.css({display: 'block'});
                mask.show();
                $('.cart_edit').html(template('editTemp', data))
                $('.pro_no').on('tap', function () {
                    mask.close();
                    tip.css({display: 'none'});
                });
            } else if ($(e.target).hasClass('mui-icon-trash')) {
                //删除
                $.ajax({
                    url: '/cart/deleteCart',
                    data: {id: [proId]},
                    type: 'get',
                    dataType: 'json',
                    success: function (data) {
                        if (data.success && data.success == true) {
                            // LT.loginAjax(window.data, function (data) {
                            //     $('.cartList').html(template('cartTemp', data));
                            // })
                            $this.parent().remove();
                        } else {
                            mui.toast('服务繁忙');
                        }
                    }
                })
            }
        });
    });
    $('.lt_topBar .fa-refresh').on('tap', function () {
        mui('#refreshContainer').pullRefresh().pulldownLoading();
        LT.loginAjax(window.data, function (data) {
            $('.cartList').html(template('cartTemp', data));
        })
    });

    function refresh() {
        mui.init({
            pullRefresh: {
                container: "#refreshContainer",
                down: {
                    auto: true,
                    callback: function () {
                        var that = this;
                        setTimeout(function () {
                            that.endPulldownToRefresh();
                            that.refresh(true)
                        }, 1000)
                    }
                }
            }
        });
    }
});
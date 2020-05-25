$(function () {
    var urlParams = LT.getUrlParams(location.search);
    $.ajax({
        url: '/product/queryProductDetail',
        type: 'get',
        dataType: 'json',
        data: 'id=' + urlParams.productId,
        success: function (data) {
            data.window = window;
            $('.mui-scroll').html(template('proTemp', data));
            mui('.mui-slider').slider({
                interval: 2000
            });
            //选尺码
            $('.sizeItem').on('tap', function () {
                $(this).siblings('span').removeClass('now');
                $(this).toggleClass('now');
            });
            var numObj = $('.pro_num');
            //减数量
            $('.pro_minus').on('tap', function () {
                if (parseInt(numObj.text()) <= 0) {
                    return false;
                } else {
                    numObj.text(parseInt(numObj.text()) - 1);
                }
            });
            //加数量
            $('.pro_add').on('tap', function () {
                if (parseInt(numObj.text()) >= parseInt(data.num)) {
                    setTimeout(function () {
                        mui.toast('客观，库存不够啦！');
                    }, 200);
                    return false;
                } else {
                    numObj.text(parseInt(numObj.text()) + 1);
                }
            });
            //加购物车
            $('.pro_addCart').on('tap', function () {
                if (!$('.sizeItem').hasClass('now')) {
                    mui.toast('请选择尺码');
                    return false;
                }
                if (numObj.text() <= 0) {
                    mui.toast('请选择数量');
                    return false;
                }
                LT.loginAjax({
                    url: '/cart/addCart',
                    type: 'post',
                    data: {
                        productId: urlParams.productId,
                        num: numObj.text(),
                        size: $('.sizeItem.now').text()
                    },
                    dataType:'json'
                }, function () {
                    var mask = mui.createMask();
                    mask.show();
                    var tip = $('.pro_tip');
                    tip.css({display: 'block'});
                    tip.on('tap', function (e) {
                        if (e.target.innerText == '是') {
                            location.href = LT.cartUrl;
                        } else {
                            $('.pro_tip').css({display: 'none'});
                            mask.close();
                        }
                    });
                })
            });
        }
    });
});
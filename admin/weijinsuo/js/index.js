$(function () {
    var winData;
    $.ajax({
        type: 'get',
        url: 'api/data.json',
        dataType: 'json',
        success: function (data) {
            $(window).on('resize', function () {
                var isMobile = $(window).width() < 768;
                if (!winData) {
                    winData = data;
                }
                var pHtml = template('pointTemp', {data: data});
                $('.carousel-indicators').html(pHtml);
                var IHtml = template('imgTemp', {data: data, isMobile: isMobile});
                $('.carousel-inner').html(IHtml);
            }).trigger('resize')
        }
    });
    var startX = 0,moveX = 0,x=0,isMoved = false;
    $('.carousel').on('touchstart',function (e) {
        startX = e.originalEvent.touches[0].pageX;
    }).on('touchmove',function (e) {
        moveX = e.originalEvent.touches[0].pageX;
        isMoved = true;
        x = moveX - startX;
    }).on('touchend',function () {
        if (isMoved && Math.abs(x) > 50) {
            if (x > 0) {
                // 上一张
                $(this).carousel('prev');
            }else {
                $(this).carousel('next');
            }
        }
    })
});
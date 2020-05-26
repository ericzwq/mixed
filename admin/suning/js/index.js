$(function () {
    var $banner = $('.sn_banner');
    var liWidth = $banner.width();
    var $imgBox = $banner.find('ul:first');
    var $dotBox = $banner.find('ul:last');
    var index = 1;
    var timeId;

    function animationFuc() {
        clearInterval(timeId);
        timeId = setInterval(function () {
            index++;
            $imgBox.animate({transform: 'translateX(' + -index * liWidth + 'px)'}, 200, function () {
                if (index >= 9) {
                    index = 1;
                    $imgBox.css({transform: 'translateX(' + -index * liWidth + 'px)'});
                } else if (index <= 0) {
                    index = 8;
                    $imgBox.css({transform: 'translateX(' + -index * liWidth + 'px)'});
                }
                $dotBox.find('li').removeClass('now').eq(index - 1).addClass('now');
            });
        }, 2000)
    }

    $imgBox.on('swipeLeft', function () {
        console.log('left')
        index++;
        animationFuc();
    });
    $imgBox.on('swipeRight', function () {
        console.log('right');
        index--;
        animationFuc();
    });
    animationFuc();
});
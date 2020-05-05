window.onload = function () {
    search();
    banner();
    downTime();
};
var bannerObj = document.querySelector('.jd_banner');

function search() {
    var search_box = document.querySelector('.jd_search_box');
    var scroll = 0, opacity = 0;
    window.onscroll = function () {
        scroll = document.body.scrollTop || document.documentElement.scrollTop || window.pageYOffset;
        if (scroll < bannerObj.offsetHeight) {
            opacity = scroll / bannerObj.offsetHeight * 0.8;
        } else {
            opacity = 0.8;
        }
        search_box.style.background = 'rgba(228, 49, 48,' + opacity + ')';
    };
}

var index = 1, startX = 0, moveX = 0, endX = 0, translate = 0, timeId, isMoved = false;
var ulObj = bannerObj.children[0];
var liWidth = ulObj.children[0].offsetWidth;

function banner() {
    scrollPic();
}

// ulObj.addEventListener('mouseover', function () {
//     clearInterval(timeId);
//     document.querySelector('.jd_logoin').style.color = 'red'
// });
//
// ulObj.addEventListener('mouseout', function () {
//     clearInterval(timeId);
//     document.querySelector('.jd_logoin').style.color = 'blue';
//     scrollPic();
// });

ulObj.addEventListener('touchstart', function (e) {
    clearInterval(timeId);
    startX = e.changedTouches[0].pageX;
});

ulObj.addEventListener('touchmove', function (e) {
    moveX = e.changedTouches[0].pageX;
    isMoved = true;
    translate = moveX - startX;// 负为左移
    clearTransition();
    setTranslate(((index) * -liWidth + translate));
});

ulObj.addEventListener('touchend', function (e) {
    if (isMoved) {
        endX = e.changedTouches[0].pageX;
        translate = endX - startX;
        if (Math.abs(translate) / liWidth > 0.3333) { //切换图片
            index = translate > 0 ? index - 1 : index + 1;
        }
        translate = 0;
        ulObj.style.transition = 'transform 20ms';
        ulObj.style.webkitTransition = 'transform 20ms';
        setTranslate(((index) * -liWidth));
    }
});

function scrollPic() {
    timeId = setInterval(function () {
        addTransition();
        setTranslate(((index + 1) * -liWidth));
        index++;
    }, 3000)
}

ulObj.addEventListener('transitionend', function () {
    if (index >= 9) {
        index = 1;
        clearTransition();
        setTranslate((index * -liWidth));
    }
    if (index <= 0) {
        index = 8;
        clearTransition();
        setTranslate((index * -liWidth))
    }
    var lis = bannerObj.children[1].children;
    for (let i = 0; i < lis.length; i++) {
        lis[i].classList.remove('now');
    }
    lis[index - 1].classList.add('now');
    startX = 0;
    moveX = 0;
    endX = 0;
    isMoved = false;
    clearInterval(timeId);
    scrollPic();
});

function clearTransition() {
    ulObj.style.transition = '';
    ulObj.style.webkitTransition = '';
}

function setTranslate(x) {
    ulObj.style.transform = 'translateX(' + x + 'px)';
    ulObj.style.webkitTransform = 'translateX(' + x + 'px)';
}

function addTransition() {
    ulObj.style.transition = 'transform 1s';
    ulObj.style.webkitTransition = 'transform 1s';
}

function downTime() {

}
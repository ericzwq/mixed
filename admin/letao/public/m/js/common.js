//区域滚动
mui('.mui-scroll-wrapper').scroll({
    indicators: true
});
//轮播图
// mui('.mui-slider').slider({
//     interval: 2000//自动轮播周期，若为0则不自动播放，默认为0
// });
var LT = {};
<<<<<<< HEAD
LT.userIndexUrl = '/m/user/layout.html';
=======
LT.userIndexUrl = '/m/user/index.html';
>>>>>>> 362e22225c41d4ceb7e44a4b3cdeb8697e6d35e7
LT.userLoginUrl = '/m/user/login.html';
LT.cartUrl = '/m/cart.html';
LT.cateUrl = '/m/cate.html';
LT.searchListUrl = '/m/searchList.html';
//获取url参数
LT.getUrlParams = function (locationSear) {
    var search = locationSear.replace('?', '');
    var searchArr = search.split('&');
    var params = {};
    searchArr.forEach(function (item) {
        var itemArr = item.split('=');
        params[itemArr[0]] = itemArr[1]
    });
    return params;
};
LT.loginAjax = function (data, callback) {
    $.ajax({
        url: data.url || '',
        type: data.type || 'post',
        dataType: data.dataType || 'json',
        data: data.data || '',
        success: function (data) {
            if (data.error == 400) {
                //未登录
                location.href = LT.userLoginUrl + '?returnUrl=' + location.href;
            }
            if (!data.error) {
                callback && callback(data);
            }
        }
    })
};

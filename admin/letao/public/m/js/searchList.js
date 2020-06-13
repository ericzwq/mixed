$(function () {
    //区域滚动
    // mui('.mui-scroll-wrapper').scroll({
    //     indicators: true
    // });

    //获取url参数
    var params = LT.getUrlParams(location.search);
    var page = 1, pageSize = 4;
    var data = {page: page, pageSize: pageSize};
    var $sear2 = $('#main_search_2');
    var $tem = $('.search_result');
    $sear2.val(params.key);//搜索框填入之前的搜索值
    data['proName'] = params.key;

    //下拉刷新
    pullDownRefresh(data);

    $('.btn_search_2').on('tap', function () {
        data.page = 1;
        data['proName'] = $sear2.val();
        // mui('#refreshContainer').pullRefresh().refresh(true);
        // getSearchData(data);
        // mui('#refreshContainer').pullRefresh().enablePullupToRefresh();
        // pullDownRefresh(data);
        mui('#refreshContainer').pullRefresh().pulldownLoading()
    });

    function getSearchData(data = {page: 1, pageSize: 4}, callback = function (data) {
        $tem.html(template('searchList', data));
    }) {
        $.ajax({
            url: '/product/queryProduct',
            type: 'get',
            data: data,
            dataType: 'json',
            success: function (data) {
                callback && callback(data);
                $('.lt_pro_item').on('tap', function () {
                    $(this).children('a').trigger('click');
                })
            }
        });
    }

    function pullDownRefresh(data = {page: 1, pageSize: 4}) {
        mui.init({
            pullRefresh: {
                container: "#refreshContainer",
                down: {
                    auto: true,
                    callback: function () {
                        var that = this;
                        data.page = 1;
                        getSearchData(data);
                        setTimeout(function () {
                            that.endPulldownToRefresh();
                            // that.enablePullupToRefresh();
                            that.refresh(true)
                        }, 1000)
                    }
                },
                up: {
                    auto: false,
                    contentrefresh: "正在加载...",
                    contentnomore: '没有更多数据了',
                    callback: function () {
                        var that = this;
                        data.page++;
                        getSearchData(data, function (data) {
                            $tem.append(template('searchList', data));
                            if (data.page * data.size >= data.count) {
                                that.endPullupToRefresh(true);
                                return false;
                            } else {
                                setTimeout(function () {
                                    that.endPullupToRefresh();
                                }, 1000)
                            }
                        });
                    }
                }
            }
        });
    }
});
$(function () {
    getFirstCateData(function (data) {
        $('.cate_left').html(template('firstCate', data));
        getSecondCateData(1, function (data) {
            $('.cate_right').html(template('secondCate', data))
        });
    });
    $('.cate_left').on('click', function (e) {
        if ($(e.target.parentNode).hasClass('now')) return false;
        var lis = e.target.parentNode.parentNode.children;
        for (let i = 0; i < lis.length; i++) {
            lis[i].classList.remove('now');
        }
        e.target.parentNode.classList.add('now');
        getSecondCateData(e.target.id, function (data) {
            if (data.total == 0) {
                $('.cate_right').html('<h3>暂无数据</h3>');
            } else {
                $('.cate_right').html(template('secondCate', data));
            }
        })
    })
});

function getFirstCateData(callback) {
    $.ajax({
        url: '/category/queryTopCategory',
        type: 'get',
        data: '',
        dataType: 'json',
        success: function (data) {
            callback && callback(data);
        }
    });
}

function getSecondCateData(id, callback) {
    id = id || 1;
    $.ajax({
        url: '/category/querySecondCategory',
        type: 'get',
        data: 'id=' + id,
        dataType: 'json',
        success: function (data) {
            callback && callback(data);
        }
    })
}
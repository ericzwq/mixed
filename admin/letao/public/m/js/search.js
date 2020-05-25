$(function () {
    //搜索
    $('.btn_search_1').on('click', function () {
        // console.log($('#main_search_1').val().replace(' ',''))
        var val = $('#main_search_1').val();
        if (!val) {
            mui.toast('请输入关键词!');
            return false;
        } else {
            location.href = LT.searchListUrl + '?key=' + val.replace(' ', '');
        }
    });
    //删除搜索历史
    $('.sh_delete').on('click', function () {
        $(this).parent().remove();
    })
});
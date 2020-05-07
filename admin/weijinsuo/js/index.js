$(function () {
    $.ajax({
        type:'post',
        url: 'api/data.json',
        dataType: 'json',
        success: function (data) {
            console.log(data)
        }
    })
});
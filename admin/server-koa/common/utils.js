"use strict";
exports.__esModule = true;
exports.formatDate = exports.setExcelType = exports.filterQuery = void 0;
var filterQuery = function (query) {
    query.page = parseInt(query.page);
    query.count = parseInt(query.count);
    if (isNaN(query.page) || isNaN(query.count)) {
        query.page = 1;
        query.count = 100;
    }
    return query;
};
exports.filterQuery = filterQuery;
var setExcelType = function (res) {
    // res.setHeader('Content-Type', 'application/vnd.ms-excel') // application/vnd.openxmlformats
    // res.setHeader('Content-Type', 'application/vnd.openxmlformats;charset=utf-8')
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=scores.xlsx');
};
exports.setExcelType = setExcelType;
function formatDate(date) {
    if (date === void 0) { date = new Date(); }
    var y = date.getFullYear();
    var m = date.getMonth() + 1 + '';
    var d = date.getDate() + '';
    var h = date.getHours() + '';
    var mi = date.getMinutes() + '';
    var s = date.getSeconds() + '';
    return "".concat(y, "-").concat(m.padStart(2, '0'), "-").concat(d.padStart(2, '0'), " ").concat(h.padStart(2, '0'), ":").concat(mi.padStart(2, '0'), ":").concat(s.padStart(2, '0'));
}
exports.formatDate = formatDate;

var User = require('../modals/user');
var Query = {}

Query.find = function (data, callback) {
    User.find(data, function (err, data) {
        callback && callback(err, data)
    });
}
module.exports = Query;
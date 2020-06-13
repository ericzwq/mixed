var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost/eric';
// MongoClient.connect(url, {useNewUrlParser: true}, function (err, db) {
//     if (err) throw err;
//     console.log('数据库已创建');
//     var dbase = db.db("eric");
//     dbase.createCollection('students', function (err, res) {
//         if (err) throw err;
//         console.log("创建集合!");
//         db.close();
//     });
// });

MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("eric");
    var myobj = { name: "菜鸟教程", url: "www.runoob" };
    dbo.collection("students").insertOne(myobj, function(err, res) {
        if (err) throw err;
        console.log("文档插入成功");
        db.close();
    });
});
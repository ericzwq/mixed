const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/eric');
var Schema = mongoose.Schema;
var schema = new Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    email: {
        type: String
    }
});
const Students = mongoose.model('Student', schema);

// 添加
const student = new Students({name: 'eric', age: 181, email: '348938@.com'});
// student.save(function (err, ret) {
//     if (err) {
//         console.log(err);
//         return false;
//     }else {
//         console.log('save success');
//     }
// })

student.save().then((data) => console.log(data+'111'),(err) => console.log(err+'222'));//简写

//查询
/*Students.find({
    name: 'eric'
}, function (err, data) {
    if (err) {
        console.log(err)
    } else {
        console.log(data)
    }
});*/

//删除
/*Students.remove({
    age: 181
}, function (err, data) {
    if (err) {
        console.log(err)
    } else {
        console.log(data)
    }
}); */

/*修改*/
// Students.update({
//     name: 'eric'
// }, {
//     name: 'eric2'
// }, function (err, data) {
//     if (err) {
//         console.log(err)
//     } else {
//         console.log(data)
//     }
// })
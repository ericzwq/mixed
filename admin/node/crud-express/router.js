var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var router = express.Router();
router.use('/public/', express.static('./public/'));
router.use('/node_modules/', express.static('../node_modules/'));//node_modules在此目录上级
router.use(bodyParser.urlencoded({extended: false}))
router.get('/', function (req, res) {
  read(function (data) {
    var data1 = JSON.parse(data);
    res.render('index.html', {fruit: ['香蕉', '苹果', '梨', '榴莲'], data: data1});
  })
});
router.get('/students/add', function (req, res) {
  res.render('addStudent.html')
});

router.post('/students/add', function (req, res) {
  read(function (data) {
    var data1 = JSON.parse(data);
    data1.push(req.body);
    write(data1);
    res.redirect('/');
  });
});
router.get('/students/edit', function (req, res) {
  let id = req.query.id;
  if (!id) {
    res.end('server busy')
  } else {
    read(function (data) {
      var data1 = JSON.parse(data);
      query(data1, id, function (item) {
        res.render('editStudent.html', {data: item});
      });

    });
  }
});
router.post('/students/edit', function (req, res) {
  let stu = req.body;
  let id = stu.id;
  read(function (data) {
    var data1 = JSON.parse(data)
    query(data1, id, function (item) {
      for (let i in item) {
        item[i] = stu[i];
      }
      write(data1);
      res.redirect('/');
    })
  })
});

function read(callback) {
  fs.readFile('./data.json', 'utf-8', function (err, data) {
    if (err) {
      res.end('server busy');
      return false;
    } else {
      callback && callback(data);
    }
  })
}

function write(data) {
  fs.writeFile('./data.json', JSON.stringify(data), 'utf8', function (err) {
    if (err) {
      res.end('server busy');
      return false;
    }
  })
}

function query(data, param, callback) {
  data.forEach(function (item) {
    if (item.id == param) {
      callback && callback(item);
    }
  })
}

module.exports = router;
var _a;

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var aa = 'aaaaaaaaaaaaaaaaaaaaaaaaaaa';
console.log(aa);
var a$1 = 'a';
var bb = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbb';
console.log(bb);
var b = 'b'; // src/foo.js

console.log('foo', a$1, b);
var foo = 'foo';
console.log('bar', a$1, b);
var bar = 'bar'; // src/main.js

var f = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var r;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return fetch('http://localhost');

          case 2:
            r = _context.sent;
            console.log(r);

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function f() {
    return _ref.apply(this, arguments);
  };
}();

console.log({
  foo: foo,
  bar: bar
});

var a = /*#__PURE__*/_createClass(function a() {
  _classCallCheck(this, a);

  _defineProperty(this, "c", 4);
});

console.log(a, (_a = new a()) === null || _a === void 0 ? void 0 : _a.c);
export { f as default };

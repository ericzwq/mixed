function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var ContentType;

(function (ContentType) {
  ContentType["json"] = "application/json";
  ContentType["formData"] = "multipart/form-data";
  ContentType["urlencoded"] = "application/x-www-from-urlencoded";
})(ContentType || (ContentType = {}));

function unionUint8Array(chunks, length) {
  var uint8Array = new Uint8Array(length);
  var position = 0;

  var _iterator = _createForOfIteratorHelper(chunks),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var chunk = _step.value;
      uint8Array.set(chunk, position);
      position += chunk.length;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return uint8Array;
}

function request(urlOrConfig, config) {
  var url,
      search = '';

  if (typeof urlOrConfig === 'string') {
    url = urlOrConfig;
  } else {
    config = urlOrConfig;
    url = config.url;
  }

  if (!url) throw new Error('The url is invalid');
  var option = Object.assign(this.option, config); // option.method = method

  var data = option.data,
      params = option.params;
  if (params != undefined) search = '?' + new URLSearchParams(params);

  if (data != undefined) {
    if (Object.prototype.toString.call(data).includes('Object')) {
      // json
      option.body = JSON.stringify(data);
      option.headers['Content-Type'] = ContentType.json;
    } else option.body = data;
  }

  var controller = option.controller || new AbortController();
  option.signal = controller.signal;
  setTimeout(function () {
    return handleTimeout(controller);
  }, option.timeout);
  if (!url.startsWith('http') && option.base) url = option.base + url;
  return new Promise( /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(resolve, reject) {
      var res, reader, chunks, total, progress, _yield$reader$read, done, value, _data;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return fetch(url + search, option);

            case 3:
              res = _context.sent;

              if (!res.body) {
                _context.next = 36;
                break;
              }

              reader = res.body.getReader();
              chunks = [];
              total = +(res.headers.get('Content-Length') || 0);
              progress = {
                total: total,
                loaded: 0
              };

            case 9:
              if (!true) {
                _context.next = 22;
                break;
              }

              _context.next = 12;
              return reader.read();

            case 12:
              _yield$reader$read = _context.sent;
              done = _yield$reader$read.done;
              value = _yield$reader$read.value;

              if (!done) {
                _context.next = 17;
                break;
              }

              return _context.abrupt("break", 22);

            case 17:
              chunks.push(value);
              progress.loaded += value.length;
              option.onDownloadProgress && option.onDownloadProgress(progress);
              _context.next = 9;
              break;

            case 22:
              _context.t0 = option.responseType;
              _context.next = _context.t0 === 'blob' ? 25 : _context.t0 === 'arrayBuffer' ? 27 : _context.t0 === 'text' ? 29 : 31;
              break;

            case 25:
              _data = new Blob(chunks);
              return _context.abrupt("break", 33);

            case 27:
              _data = unionUint8Array(chunks, progress.loaded).buffer;
              return _context.abrupt("break", 33);

            case 29:
              _data = new TextDecoder('utf-8').decode(unionUint8Array(chunks, progress.loaded));
              return _context.abrupt("break", 33);

            case 31:
              _data = new TextDecoder('utf-8').decode(unionUint8Array(chunks, progress.loaded));

              try {
                _data = JSON.parse(_data);
              } catch (e) {}

            case 33:
              // console.log({data})
              resolve(_data);
              _context.next = 37;
              break;

            case 36:
              resolve(null);

            case 37:
              _context.next = 42;
              break;

            case 39:
              _context.prev = 39;
              _context.t1 = _context["catch"](0);
              console.log('e1', _context.t1);

            case 42:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[0, 39]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
} // function Fetch(url: string, config?: Omit<FetchJsConfig, 'url'>): any;
// function Fetch(config: FetchJsConfig): any;


var Fetch = function Fetch(url, config) {
  return request.call(Fetch, url, config);
};

Fetch('', {});
Fetch({});

Fetch.create = function () {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  // function fetchInstance(url: string, config?: Omit<FetchJsConfig, 'url'>): any;
  // function fetchInstance(config: FetchJsConfig): any;
  var fetchInstance = function fetchInstance(urlOrConfig, config) {
    return request.call(fetchInstance, urlOrConfig, config);
  };

  Object.keys(Fetch).forEach(function (k) {
    if (k === 'create') return;
    var v = Fetch[k];
    fetchInstance[k] = v;
  });
  fetchInstance.option = Object.assign(Fetch.option, config);
  return fetchInstance;
};

var defaultConfig = {
  timeout: 10000,
  headers: {}
};
Fetch.option = defaultConfig;
['get', 'post', 'put', 'delete', 'options', 'head', 'trace', 'connect'].forEach(function (method) {
  Fetch[method] = function (url) {
    var parameter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    config.method = method;
    return request.call(this, url, Object.assign(parameter, config));
  };
});

function handleTimeout(controller) {
  controller.abort();
}

export { Fetch as default };

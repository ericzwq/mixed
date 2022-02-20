function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

(function (global, factory) {
  (typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? factory(exports) : typeof define === 'function' && define.amd ? define(['exports'], factory) : (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.HttpFetch = {}));
})(this, function (exports) {
  'use strict';

  function interceptor(reqInterceptors, request, resInterceptors, config) {
    var response = handleRequestInterceptors(Promise.resolve(config), reqInterceptors).then(function (_config) {
      return request(config = _config);
    });
    return handleResponseInterceptors(response, resInterceptors, config);
  }

  function handleRequestInterceptors(promise, interceptors) {
    var i = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    if (i === interceptors.length) return promise;
    return handleRequestInterceptors(promise.then(interceptors[i], interceptors[i + 1]), interceptors, i + 2);
  }

  function handleResponseInterceptors(promise, interceptors, config) {
    var hasResolver = false,
        resolved = false;

    var _loop = function _loop(i) {
      var resolver = interceptors[i];
      if (typeof resolver === 'function') hasResolver = true;
      var rejecter = interceptors[i + 1];
      promise = promise.then(function (data) {
        return typeof resolver === 'function' ? resolved ? resolver(data, data && data.response, config) : (resolved = true) && resolver(data.data, data.response, config) : data;
      }, rejecter);
    };

    for (var i = 0; i < interceptors.length; i += 2) {
      _loop(i);
    }

    return hasResolver ? promise : promise.then(function (_ref) {
      var data = _ref.data;
      return data;
    });
  }

  var ContentType;

  (function (ContentType) {
    ContentType["json"] = "application/json";
    ContentType["formData"] = "multipart/form-data";
    ContentType["urlencoded"] = "application/x-www-from-urlencoded";
    ContentType["text"] = "text/plain";
  })(ContentType || (ContentType = {}));

  var isProduction = process.env.NODE === 'production';

  function deepClone(o) {
    if (_typeof(o) !== 'object') return o;
    if (Array.isArray(o)) return o.map(deepClone);
    var res = {};
    Object.keys(o).forEach(function (k) {
      return res[k] = deepClone(o[k]);
    });
    return res;
  }

  function urlSerialize(url, o) {
    var s = paramsSerialize(o);
    s = s[0] === '&' ? s.slice(1) : s;
    return url + (s ? (url.lastIndexOf('?') > -1 ? '&' : '?') + s : '');
  }

  function paramsSerialize(o) {
    var s = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    return _typeof(o) === 'object' ? o != null ? Object.keys(o).reduce(function (p, c) {
      return p + (o[c] != null ? '&' + c + '=' + paramsSerialize(o[c]) : '');
    }, s) : s : s + o;
  }

  function type(o) {
    return Object.prototype.toString.call(o).slice(8, -1);
  }

  function makeError(reject, error, config, response) {
    error.config = config;
    error.response = response;

    if (response) {
      response.text().then(function (data) {
        try {
          data = JSON.parse(data);
        } catch (e) {}

        error.data = data;
        reject(error);
      });
    } else reject(error);
  }

  function request(config) {
    if (!isProduction && config.signal) console.error('[HttpFetch warn]: If you want to abort request, please use controller instead signal.');
    if (config.method) config.method = config.method.toUpperCase();
    var controller = config.controller || new AbortController();
    config.signal = controller.signal;
    var url = '' + config.url;
    if (!url.startsWith('http') && !url.startsWith('//') && config.base) url = config.base + url;
    var data = config.data,
        params = config.params;
    if (params != undefined) url = urlSerialize(url, params);

    if (data != undefined) {
      if (['Object', 'Array', 'Boolean', 'Number'].includes(type(data))) {
        // json
        config.body = JSON.stringify(data);
        if (!config.headers) config.headers = {
          'Content-Type': ContentType.json
        };else if (type(config.headers) === 'Object') {
          // Record<string, string>
          if (!config.headers['Content-Type']) config.headers['Content-Type'] = ContentType.json;
        } else if (config.headers instanceof Headers) {
          if (!config.headers.has('Content-Type')) config.headers.set('Content-Type', ContentType.json);
        } else if (Array.isArray(config.headers)) {
          // string[][]
          var headers = config.headers.find(function (headers) {
            return headers[0].toLowerCase() === 'content-type';
          });
          if (!headers) config.headers.push(['Content-Type', ContentType.json]);
        } else if (!isProduction) console.error('[HttpFetch warn]: The config headers is invalid, you can set {}, [["Content-Type", "application/json"]], or a instance of Headers');
      } else config.body = data;
    }

    return new Promise( /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(resolve, reject) {
        var response, reader, total, progress, stream;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.prev = 0;
                if (config.timeout) setTimeout(function () {
                  return handleTimeout(controller, reject, config);
                }, config.timeout);
                _context2.next = 4;
                return fetch(url, config);

              case 4:
                response = _context2.sent;

                if (response.ok) {
                  _context2.next = 7;
                  break;
                }

                return _context2.abrupt("return", makeError(reject, new Error('Fetch failed with status ' + response.status), config, response));

              case 7:
                if (response.body) {
                  _context2.next = 9;
                  break;
                }

                return _context2.abrupt("return", resolve({
                  data: null,
                  response: new Response()
                }));

              case 9:
                reader = response.body.getReader();
                total = +(response.headers.get('Content-Length') || 0);
                progress = {
                  total: total,
                  loaded: 0
                };
                stream = new ReadableStream({
                  start: function () {
                    var _start = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(controller) {
                      var _yield$reader$read, done, value, data;

                      return regeneratorRuntime.wrap(function _callee$(_context) {
                        while (1) {
                          switch (_context.prev = _context.next) {
                            case 0:
                              _context.prev = 0;

                            case 1:
                              if (!true) {
                                _context.next = 14;
                                break;
                              }

                              _context.next = 4;
                              return reader.read();

                            case 4:
                              _yield$reader$read = _context.sent;
                              done = _yield$reader$read.done;
                              value = _yield$reader$read.value;

                              if (!done) {
                                _context.next = 9;
                                break;
                              }

                              return _context.abrupt("break", 14);

                            case 9:
                              controller.enqueue(value);
                              progress.loaded += value.length;
                              config.onDownloadProgress && config.onDownloadProgress(progress);
                              _context.next = 1;
                              break;

                            case 14:
                              _context.next = 19;
                              break;

                            case 16:
                              _context.prev = 16;
                              _context.t0 = _context["catch"](0);
                              return _context.abrupt("return", makeError(reject, _context.t0, config));

                            case 19:
                              controller.close();

                              if (!(config.responseType === 'stream')) {
                                _context.next = 22;
                                break;
                              }

                              return _context.abrupt("return", resolve({
                                data: stream,
                                response: response
                              }));

                            case 22:
                              _context.prev = 22;

                              if (!['json', 'blob', 'text', 'arrayBuffer', 'formData'].includes(config.responseType)) {
                                _context.next = 29;
                                break;
                              }

                              _context.next = 26;
                              return new Response(stream)[config.responseType]();

                            case 26:
                              data = _context.sent;
                              _context.next = 33;
                              break;

                            case 29:
                              _context.next = 31;
                              return new Response(stream).text();

                            case 31:
                              data = _context.sent;

                              try {
                                data = JSON.parse(data);
                              } catch (e) {}

                            case 33:
                              _context.next = 38;
                              break;

                            case 35:
                              _context.prev = 35;
                              _context.t1 = _context["catch"](22);
                              return _context.abrupt("return", makeError(reject, new Error('Response parse error'), config));

                            case 38:
                              resolve({
                                data: data,
                                response: response
                              });

                            case 39:
                            case "end":
                              return _context.stop();
                          }
                        }
                      }, _callee, null, [[0, 16], [22, 35]]);
                    }));

                    function start(_x3) {
                      return _start.apply(this, arguments);
                    }

                    return start;
                  }()
                });
                _context2.next = 18;
                break;

              case 15:
                _context2.prev = 15;
                _context2.t0 = _context2["catch"](0);
                // user aborted will in, timeout will in but the promise is already be rejected
                makeError(reject, _context2.t0, config);

              case 18:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, null, [[0, 15]]);
      }));

      return function (_x, _x2) {
        return _ref2.apply(this, arguments);
      };
    }());
  }

  function handleTimeout(controller, reject, config) {
    controller.abort();
    makeError(reject, new Error("Timeout of ".concat(config.timeout, "ms exceeded")), config);
  }

  function handler(urlOrConfig) {
    var _this = this;

    var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var url;

    if (typeof urlOrConfig === 'string') {
      url = urlOrConfig;
    } else {
      config = urlOrConfig;
      url = config.url;
    }

    Object.keys(this.config).forEach(function (k) {
      return k in config ? 0 : config[k] = deepClone(_this.config[k]);
    });
    config.url = url;
    return interceptor(this.interceptors.request.handlers, request, this.interceptors.response.handlers, config);
  }

  var Fetch = function Fetch(urlOrConfig, config) {
    return handler.call(Fetch, urlOrConfig, config);
  };

  Fetch.config = {};
  Fetch.interceptors = {
    request: {
      use: function use(onFulfilled, onRejected) {
        return this.handlers.push(onFulfilled, onRejected);
      },
      handlers: []
    },
    response: {
      use: function use(onFulfilled, onRejected) {
        return this.handlers.push(onFulfilled, onRejected);
      },
      handlers: []
    }
  };

  Fetch.create = function () {
    var _this2 = this;

    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var fetchInstance = function fetchInstance(urlOrConfig, config) {
      return handler.call(fetchInstance, urlOrConfig, config);
    };

    Object.keys(this).forEach(function (k) {
      if (k === 'create') return;
      var v = _this2[k];
      fetchInstance[k] = v;
    });
    Object.keys(this.config).forEach(function (k) {
      return k in config ? 0 : config[k] = deepClone(_this2.config[k]);
    });
    fetchInstance.config = config;
    return fetchInstance;
  };

  ['post', 'put', 'patch'].forEach(function (method) {
    Fetch[method] = function (url, data) {
      var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      config.method = method;
      config.data = data;
      return handler.call(this, url, config);
    };
  });
  ['get', 'delete', 'options', 'head'].forEach(function (method) {
    Fetch[method] = function (url, params) {
      var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      config.method = method;
      config.params = params;
      return handler.call(this, url, config);
    };
  });
  exports["default"] = Fetch;
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
});

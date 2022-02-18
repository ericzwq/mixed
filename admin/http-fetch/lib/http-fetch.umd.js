function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

(function (global, factory) {
  (typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? factory(exports) : typeof define === 'function' && define.amd ? define(['exports'], factory) : (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.FetchJs = {}));
})(this, function (exports) {
  'use strict';

  function interceptor(reqInterceptors, request, resInterceptors, config) {
    var response = handleRequestInterceptors2(Promise.resolve(config), reqInterceptors).then(function (_config) {
      return request(config = _config);
    });
    return handleResponseInterceptors2(response, resInterceptors, config);
  }

  function handleRequestInterceptors2(promise, interceptors) {
    var i = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    if (i === interceptors.length) return promise;
    return handleRequestInterceptors2(promise.then(interceptors[i], interceptors[++i]), interceptors, i + 1);
  } // function handleRequestInterceptors(status: 'resolve' | 'reject', interceptors: (HttpFetchRequestResolver | HttpFetchRequestRejecter)[], config: HttpFetchConfig, i = 0): Promise<HttpFetchConfig> {
  //   const method = status === 'resolve' ? Promise.resolve.bind(Promise) : Promise.reject.bind(Promise)
  //   if (i === interceptors.length) return method(config)
  //   const onFulfilled = interceptors[i] || (() => config)
  //   const onRejected = interceptors[++i] as HttpFetchRequestRejecter
  //   const handler = status === 'resolve' ? onFulfilled : onRejected
  //   return method<HttpFetchConfig>(handler(config)).then<HttpFetchConfig, HttpFetchConfig>(
  //     (config) => handleRequestInterceptors('resolve', interceptors, config, i + 1),
  //     (reason) => handleRequestInterceptors('reject', interceptors, reason, i + 1)
  //   )
  // }
  // function f<T = 'req' | 'res', R = T extends 'req' ? HttpFetchConfig : unknown>(status: 'resolve' | 'reject', interceptors: (HttpFetchRequestResolver | HttpFetchRequestRejecter)[], config: R, i = 0): Promise<R> {
  //   const method = status === 'resolve' ? Promise.resolve.bind(Promise) : Promise.reject.bind(Promise)
  //   if (i === interceptors.length) return method(config)
  //   const onFulfilled = interceptors[i] || (() => config)
  //   const onRejected = interceptors[++i] as any
  //   const handler = status === 'resolve' ? onFulfilled : onRejected
  //   return method<R>(handler(config as any)).then<R, R>(
  //     (config) => f('resolve', interceptors, config, i + 1),
  //     (reason) => f('reject', interceptors, reason, i + 1)
  //   )
  // }


  function handleResponseInterceptors2(promise, interceptors, config) {
    var i = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    if (i === interceptors.length) return promise;
    var handler = interceptors[i];
    return handleResponseInterceptors2(promise.then(function (data) {
      return typeof handler === 'function' ? handler(data, config) : data;
    }, interceptors[++i]), interceptors, config, i + 1);
  } // function handleResponseInterceptors<T>(interceptors: (HttpFetchResponseHandler | resErr)[], data: unknown, config: HttpFetchConfig, i = 0): Promise<T> {
  //   if (i === interceptors.length) return Promise.resolve(data as T)
  //   const onFulfilled = interceptors[i] || (() => data) as HttpFetchResponseHandler
  //   const onRejected = interceptors[++i] as resErr
  //   return Promise.resolve<unknown>(onFulfilled(data, config)).then<unknown, any>(data => handleResponseInterceptors(interceptors, data, config, i + 1), onRejected)
  // }


  var ContentType;

  (function (ContentType) {
    ContentType["json"] = "application/json";
    ContentType["formData"] = "multipart/form-data";
    ContentType["urlencoded"] = "application/x-www-from-urlencoded";
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

  function paramsSerialize(o) {
    var s = serializer(o);
    s = s[0] === '&' ? s.slice(1) : s;
    return s ? '?' + s : '';
  }

  function serializer(o) {
    var s = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    return _typeof(o) === 'object' ? o != null ? Object.keys(o).reduce(function (p, c) {
      return p + (o[c] != null ? '&' + c + '=' + serializer(o[c]) : '');
    }, s) : s : s + o;
  }

  function makeError(reject, error, config, response) {
    error.config = config;
    error.response = response;

    if (response) {
      response.clone().text().then(function (data) {
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
    var data = config.data,
        params = config.params;
    var search = '';
    if (params != undefined) search = paramsSerialize(params);

    if (data != undefined) {
      if (['Object', 'Array', 'Boolean', 'Number', 'Null'].includes(Object.prototype.toString.call(data).slice(8, -1))) {
        // json
        config.body = JSON.stringify(data);
        if (!config.headers['Content-Type']) config.headers['Content-Type'] = ContentType.json;
      } else config.body = data;
    }

    var controller = config.controller || new AbortController();
    config.signal = controller.signal;
    var url = '' + config.url;
    if (!url.startsWith('http') && !url.startsWith('//') && config.base) url = config.base + url;
    return new Promise( /*#__PURE__*/function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(resolve, reject) {
        var res, reader, total, progress, stream;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (config.timeout) setTimeout(function () {
                  return handleTimeout(controller, reject, config);
                }, config.timeout);
                _context2.prev = 1;
                _context2.next = 4;
                return fetch(url + search, config);

              case 4:
                res = _context2.sent;

                if (res.ok) {
                  _context2.next = 7;
                  break;
                }

                return _context2.abrupt("return", makeError(reject, new Error('Fetch failed with status ' + res.status), config, res));

              case 7:
                if (res.body) {
                  reader = res.body.getReader();
                  total = +(res.headers.get('Content-Length') || 0);
                  progress = {
                    total: total,
                    loaded: 0
                  };
                  stream = new ReadableStream({
                    start: function () {
                      var _start = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(controller) {
                        var _yield$reader$read, done, value, response;

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

                                return _context.abrupt("return", resolve(stream));

                              case 22:
                                _context.prev = 22;

                                if (!['json', 'blob', 'text', 'arrayBuffer', 'formData'].includes(config.responseType)) {
                                  _context.next = 29;
                                  break;
                                }

                                _context.next = 26;
                                return new Response(stream)[config.responseType]();

                              case 26:
                                response = _context.sent;
                                _context.next = 33;
                                break;

                              case 29:
                                _context.next = 31;
                                return new Response(stream).text();

                              case 31:
                                response = _context.sent;

                                try {
                                  response = JSON.parse(response);
                                } catch (e) {}

                              case 33:
                                _context.next = 38;
                                break;

                              case 35:
                                _context.prev = 35;
                                _context.t1 = _context["catch"](22);
                                return _context.abrupt("return", makeError(reject, new Error('Response parse error'), config));

                              case 38:
                                resolve(response);

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
                } else {
                  resolve(null);
                }

                _context2.next = 13;
                break;

              case 10:
                _context2.prev = 10;
                _context2.t0 = _context2["catch"](1);
                // user aborted will in, timeout will in but the promise is already be rejected
                makeError(reject, _context2.t0, config);

              case 13:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, null, [[1, 10]]);
      }));

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
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

  Fetch.config = {
    timeout: 0,
    headers: {}
  };
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

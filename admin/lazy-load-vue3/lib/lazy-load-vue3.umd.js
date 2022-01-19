(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global['lazy-load-vue3'] = {}));
}(this, (function (exports) { 'use strict';

  var index = () => {
      console.log(`the answer is ${'sadf'}`);
  };
  let c = 3;
  const arr = [1, 2];
  const [a, b] = arr;
  console.log(a, b, c, arr?.a);
  async function f() {
      const r = await fetch('asfd');
      console.dir(r);
  }

  exports.default = index;
  exports.f = f;

  Object.defineProperty(exports, '__esModule', { value: true });

})));

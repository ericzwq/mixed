import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import commonjs from "@rollup/plugin-commonjs"
import typescript from 'rollup-plugin-typescript2'
import jsx from 'acorn-jsx'

const extensions = [".ts", ".js", ".tsx"]
const output = []
const globals = {
  vue: 'Vue'
}
const path = 'lib/';
['iife', 'es', 'umd'].forEach((item) => {
  output.push({
    dir: path + item,
    format: item,
    globals,
  });
});

export default {
  input: 'packages2/index.ts',
  output,
  plugins: [
    typescript({
      lib: ["es5", "es6", "dom"],
      target: "es5", // 输出目标
      noEmitOnError: true, // 运行时是否验证ts错误
    }),
    resolve({mainFields: ["module", "main", "browser"]}),
    commonjs({extensions, sourceMap: true}),
    babel({babelHelpers: "bundled", extensions}), // babelHelpers是bable的最佳实践方案 extensions编译的扩展文件
  ],
  acornInjectPlugins: [jsx()],
  external: ["vue"],
}

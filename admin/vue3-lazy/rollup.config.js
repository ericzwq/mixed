import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import commonjs from "@rollup/plugin-commonjs"
import typescript from 'rollup-plugin-typescript2'
import jsx from 'acorn-jsx'
import cssnano from "cssnano";
import postcss from 'rollup-plugin-postcss'

const extensions = [".ts", ".js", ".tsx"]
const output = []
const globals = {
  vue: 'Vue',
  '@antv/g2': 'G2',
}
const path = 'lib/';
['iife', 'es', 'umd'].forEach((item) => {
  output.push({
    dir: path + item,
    format: item,
    globals,
    name: 'chartv',
  });
});

export default {
  input: 'packages/index.ts',
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
    postcss({plugins: [cssnano], extract: 'dist/css/z-style.css'})
  ],
  acornInjectPlugins: [jsx()],
  external: ["vue", "@antv/g2"],
}

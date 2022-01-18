import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import path from 'path'
// import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import pkg from '../package.json'

const deps = Object.keys(pkg.dependencies)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const vue = require('rollup-plugin-vue')
const extensions = [".ts", ".js", ".tsx"]

export default [
  {
    input: path.resolve(__dirname, '../packages/index.ts'),
    output: [
      {
        format: 'es',
        dir: 'lib/es'
      }
    ],
    plugins: [
      typescript({
        lib: ["es5", "es6", "dom"],
        target: "es5", // 输出目标
        noEmitOnError: true, // 运行时是否验证ts错误
      }),
      resolve({mainFields: ["module", "main", "browser"]}),
      // commonjs({ extensions, sourceMap: true }),
      babel({babelHelpers: "bundled", extensions}), // babelHelpers是bable的最佳实践方案 extensions编译的扩展文件
    ],
  },
]

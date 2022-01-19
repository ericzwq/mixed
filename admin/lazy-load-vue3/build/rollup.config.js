// import vue from "rollup-plugin-vue";
import typescript from "rollup-plugin-typescript2";
import resolve from "rollup-plugin-node-resolve";
import {name} from "../package.json";
import commonjs from "rollup-plugin-commonjs";
import {terser} from 'rollup-plugin-terser'
import babel from 'rollup-plugin-babel'

const file = type => `lib/${name}.${type}.js`

export {name, file};
export default {
  input: "test/index.ts",
  output: {
    name,
    file: file("esm"),
    format: "es",
  },
  plugins: [
    resolve(),
    commonjs(),
    babel({
      runtimeHelpers: true,
      exclude: 'node_modules/**',
      presets: [
        [
          "@babel/preset-env",
          {
            modules: false,
            "targets": {
              "ie": 10
            },
            useBuiltIns: 'usage',
          }]
      ]
    }),
    typescript({
      tsconfigOverride: {
        compilerOptions: {declaration: true, declarationDir: 'types'},
        exclude: ["tests/**/*.ts", "tests/**/*.tsx"],
      },
      useTsconfigDeclarationDir: true
    }),
    // vue(),
    // terser()
  ],
  external: ["vue"],
};

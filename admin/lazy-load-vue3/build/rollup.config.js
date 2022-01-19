import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from "rollup-plugin-typescript2";
import {name} from "../package.json";
import {terser} from 'rollup-plugin-terser'

const file = type => `lib/${name}.${type}.js`

export {name, file};
export default {
  input: "src/index.ts",
  output: {
    name,
    file: file("esm"),
    format: "es",
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfigOverride: {
        compilerOptions: {declaration: true, declarationDir: 'types'},
        exclude: ["tests/**/*.ts", "tests/**/*.tsx"],
      },
      useTsconfigDeclarationDir: true
    })
  ],
  external: ["vue"],
};

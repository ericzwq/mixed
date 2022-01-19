// rollup.config.js
import json from 'rollup-plugin-json';
import {getBabelOutputPlugin } from '@rollup/plugin-babel'
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: 'src/main.js',
  output: {
    file: 'bundle.js',
    format: 'esm'
  },
  plugins: [
    commonjs(),
    getBabelOutputPlugin({
      presets: ['@babel/preset-env']
    })
  ]
};

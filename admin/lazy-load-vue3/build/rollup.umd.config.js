import basicConfig, {name, file} from "./rollup.config";
import {getBabelOutputPlugin} from "@rollup/plugin-babel";

const config = {
  ...basicConfig,
  output: {
    name,
    file: file("umd"),
    format: "esm", // 后面再用babel转为umd
    globals: {
      vue: "Vue",
    },
    exports: "named"
  }
}
config.plugins.push(...[
  getBabelOutputPlugin({
    presets: [['@babel/preset-env', {modules: 'umd'}]]
  })
  // terser()
])

export default config

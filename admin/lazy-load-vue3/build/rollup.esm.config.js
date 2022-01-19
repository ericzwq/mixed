import basicConfig, {name, file} from "./rollup.config";
import {getBabelOutputPlugin} from "@rollup/plugin-babel";

const config = {
  ...basicConfig,
  output: {
    name,
    file: file("esm"),
    format: "es"
  }
}
config.plugins.push(...[
  getBabelOutputPlugin({
    presets: ['@babel/preset-env']
  })
  // terser()
])
export default config

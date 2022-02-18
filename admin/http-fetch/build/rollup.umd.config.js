import basicConfig, {file} from "./rollup.config";

export default {
  ...basicConfig,
  output: {
    name: 'HttpFetch',
    file: file("umd"),
    format: "umd",
    globals: {
      vue: "Vue",
    },
    exports: "named"
  }
}

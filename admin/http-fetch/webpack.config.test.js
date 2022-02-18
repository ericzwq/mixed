const path = require("path");
const webpack = require("webpack");
const config = require('./webpack.config.base')
config.entry = path.join(__dirname, './test/index.ts')
config.plugins.push(new webpack.DefinePlugin({
  'process.env': '"test"'
}))
module.exports = config

let path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
console.log(HtmlWebpackPlugin)
module.exports = {
  entry: path.resolve(__dirname, 'index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      // template: path.resolve(__dirname, 'index.html'),
      template: './index.html',
      filename: 'index.html',
    })
  ]
}

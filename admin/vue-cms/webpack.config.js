const path = require('path');
const webpack = require('webpack');// 启用热更新的 第2步
const htmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')// runtime-only vue 插件引入
module.exports = {
  // devtool: 'source-map', //debugger模式
  entry: path.join(__dirname, './src/index.js'),
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, './dist')
  },
  devServer: { // 这是配置 dev-server 命令参数的第二种形式，相对来说，这种方式麻烦一些
    //  --open --port 3000 --contentBase dist --hot
    open: true, // 自动打开浏览器
    port: 3000, // 设置启动时候的运行端口
    contentBase: 'dist', // 指定托管的根目录
    hot: true, // 启用热更新 的 第1步
    // host: '192.168.0.106'
  },
  plugins: [// 配置插件的节点
    new webpack.HotModuleReplacementPlugin(), // new 一个热更新的 模块对象， 这是 启用热更新的第 3 步
    // new htmlWebpackPlugin({ // 创建一个 在内存中 生成 HTML  页面的插件
    //     template: path.join(__dirname, 'dist/index.html'), // 指定 模板页面，将来会根据指定的页面路径，去生成内存中的 页面
    //     filename: 'index.html' // 指定生成的页面的名称
    // }),
    new VueLoaderPlugin() // runtime-only 插件调用
  ],
  module: {// 这个节点，用于配置 所有 第三方模块 加载器
    rules: [// 所有第三方模块的 匹配规则
      {test: /\.css$/, use: ['style-loader', 'css-loader']}, //  配置处理 .css 文件的第三方loader 规则
      {test: /\.less$/, use: ['style-loader', 'css-loader', 'less-loader']}, //配置处理 .less 文件的第三方 loader 规则
      {test: /\.scss$/, use: ['style-loader', 'css-loader', 'sass-loader']}, //配置处理 .scss 文件的第三方 loader 规则
      // {test: /\.(png|jpg|bmp|jpeg)$/, use: ['url-loader?limit=2000&name=-[hash:2][name].[ext]']},
      {
        test: /\.(png|jpg|bmp|jpeg|gif)$/,
        use: [{
          loader: 'url-loader',
          options: {
            esModule: false, //图片处理
            name: '[hash:4][name].[ext]',
            limit: 2000,
            outputPath: 'images'
          },
        }]
      },
      // limit 给定的值，是图片的大小，单位是 byte， 如果我们引用的 图片，大于或等于给定的 limit值，则不会被转为base64格式的字符串， 如果 图片小于给定的 limit 值，则会被转为 base64的字符串
      {test: /\.(ttf|eot|svg|woff|woff2)$/, use: 'url-loader'}, // 处理 字体文件的 loader
      {test: /\.js$/, use: 'babel-loader', exclude: /node_modules/}, // 配置 Babel 来转换高级的ES语法
      {test: /\.vue$/, use: 'vue-loader'} // 用于在runtime-only的vue包下运行完整功能的vue（runtime-only包不是vue.js包，
      // 查找package中的main属性发现其为vue.runtime.common.js包，是vue.js的阉割版
      /*runtime-only编译过程：render -> Virtual DOM -> UI
        runtime + compiler 编译过程： template  -> AST(抽象语法树)  ->  render -> Virtual DOM -> UI
        可以简单理解为runtime-only在本地编译模板，节省了在客户端的运行时间，提高性能，2者最终都会编译为render函数来渲染页面*/
    ]
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {// 修改 Vue 被导入时候的包的路径
      // "vue$": "vue/dist/vue.js"
    }
  },
  performance: {
    hints: false //性能优化提示
  },
  mode: 'production' //production development
}
/*.babelrc文件注释*/
//  在plugins数组中加入此代码"transform-remove-strict-mode"可禁用严格模式打包
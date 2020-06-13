const path = require('path');
const webpack = require('webpack');// 启用热更新的 第2步
const htmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    devServer: { // 这是配置 dev-server 命令参数的第二种形式，相对来说，这种方式麻烦一些
        //  --open --port 3000 --contentBase dist --hot
        open: true, // 自动打开浏览器
        port: 3000, // 设置启动时候的运行端口
        contentBase: 'dist', // 指定托管的根目录
        hot: true // 启用热更新 的 第1步
    },
    plugins: [// 配置插件的节点
        new webpack.HotModuleReplacementPlugin(), // new 一个热更新的 模块对象， 这是 启用热更新的第 3 步
        new htmlWebpackPlugin({ // 创建一个 在内存中 生成 HTML  页面的插件
            template: path.join(__dirname, 'dist/index.html'), // 指定 模板页面，将来会根据指定的页面路径，去生成内存中的 页面
            filename: 'index.html' // 指定生成的页面的名称
        })
    ],
    module: {// 这个节点，用于配置 所有 第三方模块 加载器
        rules: [// 所有第三方模块的 匹配规则
            {test: /\.css$/, use: ['style-loader', 'css-loader']}, //  配置处理 .css 文件的第三方loader 规则
            {test: /\.less$/, use: ['style-loader', 'css-loader', 'less-loader']}, //配置处理 .less 文件的第三方 loader 规则
            {test: /\.scss$/, use: ['style-loader', 'css-loader', 'sass-loader']}, //配置处理 .scss 文件的第三方 loader 规则
            {test: /\.(png|jpg|bmp|jpeg)$/, use: 'url-loader?limit=1000&name=-[hash:8][name].[ext]'},
            // limit 给定的值，是图片的大小，单位是 byte， 如果我们引用的 图片，大于或等于给定的 limit值，则不会被转为base64格式的字符串， 如果 图片小于给定的 limit 值，则会被转为 base64的字符串
            { test: /\.(ttf|eot|svg|woff|woff2)$/, use: 'url-loader' }, // 处理 字体文件的 loader
        ]
    }
}
# **webpack-config**
配置编译文件入口及出口

    `const path = require('path');
     module.exports = {
         entry: './src/index.js',
         output: {
             filename: 'bundle.js',
             path: path.resolve(__dirname, 'dist')
         }
     };`
# **webpack-dev-server配置**
1.先下载包webpack-dev-server

    `npm i webpack-dev-server`
    
2 在package.json文件中的scripts对象中添加配置

    `"dev":"webpack-dev-server --open --port 3000 --contentBase dist --hot"`
webpack表示启动的包，--open 自动开启浏览器，--port 设置端口，--contentBase 打开路径，--hot 局部刷新

3 控制台输入命令启动即可
    
    `npm run dev`
    
注：webpack-dev-server启动后默认开启8080服务端口，且在内存中自动生成编译后的文件（代码改动后），其路径为根路径，即/bundle.js，与手动打包的文件不同

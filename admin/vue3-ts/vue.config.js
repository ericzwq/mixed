let UglifyJsPlugin, AutoImport, Components, ElementPlusResolver
UglifyJsPlugin = require('uglifyjs-webpack-plugin')
AutoImport = require('unplugin-auto-import/webpack')
Components = require('unplugin-vue-components/webpack')
;({ElementPlusResolver} = require('unplugin-vue-components/resolvers'))

const isProduction = process.env.NODE_ENV === 'production',
  uglifyJsPlugin = new UglifyJsPlugin({
    uglifyOptions: {
      compress: {
        drop_console: true,  //注释console
        drop_debugger: true, //注释debugger
        pure_funcs: ['console.log'], //移除console.log
      },
    },
  })
// const autoImport = AutoImport({resolvers: [ElementPlusResolver()]})
const autoImport = AutoImport({ // element-plus使用自动导入方式会地址指令loading不可用
  imports: [
    'vue',
    'vue-router',
    {
      'vuex': ['useStore']
    }
  ],
})
const components = Components({resolvers: [ElementPlusResolver()]})
module.exports = {
  publicPath: '/price-adjustment2',
  assetsDir: 'static',
  filenameHashing: true,
  devServer: {
    proxy: {
      '/api': {
        // target: 'https://106.75.247.94',
        target: 'https://erp.haiyingshuju.com',
        pathRewrite: {
          '^/api': '/'
        }
      }
    }
  },
  configureWebpack: {
    plugins: isProduction ?
      [uglifyJsPlugin, autoImport, components] :
      [autoImport, components]
  }
};

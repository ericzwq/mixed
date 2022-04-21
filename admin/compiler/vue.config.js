const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  productionSourceMap: !isProduction,
  chainWebpack: config => {
    config.when(!isProduction, config => config.devtool('cheap-module-source-map'))
  }
}

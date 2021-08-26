const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

// Generate pages object
const pagesObj = {};

const chromeName = ["popup", "options"];

chromeName.forEach(name => {
  pagesObj[name] = {
    entry: `src/${name}/index.js`,
    template: "public/index.html",
    filename: `${name}.html`
  };
});

const plugins =
  process.env.NODE_ENV === "production"
    ? [
      {
        from: path.resolve("src/manifest.production.json"),
        to: `${path.resolve("dist")}/manifest.json`
      }
    ]
    : [
      {
        from: path.resolve("src/manifest.development.json"),
        to: `${path.resolve("dist")}/manifest.json`
      }
    ];

module.exports = {
  pages: pagesObj,
  configureWebpack: {
    entry: {
      content: './src/content/index.js',
      background: './src/background/index.js'
    },
    output: {
      filename: 'js/[name].js'
    },
    plugins: [CopyWebpackPlugin(plugins)]
  },
  css: {
    extract: {
      filename: 'css/[name].css' // chunkFilename: 'css/[name].css'
    }
  },
  chainWebpack: config => {
    config.module.rule('images')
      .test(/\.(png|jpe?g|gif|webp)(\?.*)?$/)
      .use('url-loader')
      .loader('file-loader')
      .options({
        name: 'icons/[name].[ext]'
      })
  },
  // chainWebpack: config => {
  //   config
  //     .module
  //     .rule('images')
  //     .use('url-loader')
  //     .tap(options => {
  //       options.name = `icons/[name].[ext]`;
  //       return options
  //     })
  // }
};

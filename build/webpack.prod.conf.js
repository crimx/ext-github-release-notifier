'use strict'
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const GenerateJsonPlugin = require('generate-json-webpack-plugin')
const manifest = require('../src/manifest/base.manifest.json')
const version = require('../package.json').version

const env = require('../config/prod.env')

const browsers = ['chrome', 'firefox']

const webpackConfig = merge(baseWebpackConfig, {
  entry: browsers.reduce((entry, browser) => {
    entry[browser + '/popup'] = './src/popup/main.js'
    entry[browser + '/background'] = './src/background/main.js'
    return entry
  }, {}),
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true,
      usePostCSS: true
    })
  },
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('[name].js'),
    chunkFilename: utils.assetsPath('[id].js')
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': env
    }),
    // tailor moment locales
    new webpack.ContextReplacementPlugin(/moment[\\/]locale$/, /^\.\/en$/),
    new LodashModuleReplacementPlugin(),
    new UglifyJsPlugin({
      uglifyOptions: {
        ie8: false,
        ecma: 6,
        drop_console: true,
        output: {
          comments: false,
          beautify: false
        },
        warnings: false
      },
      sourceMap: config.build.productionSourceMap,
      parallel: true
    }),
    // extract css into its own file
    new ExtractTextPlugin({
      filename: utils.assetsPath('[name].css'),
      // set the following option to `true` if you want to extract CSS from
      // codesplit chunks into this main css file as well.
      // This will result in *all* of your app's CSS being loaded upfront.
      allChunks: false,
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin({
      cssProcessorOptions: config.build.productionSourceMap
        ? { safe: true, map: { inline: false } }
        : { safe: true }
    }),
    // keep module.id stable when vender modules does not change
    new webpack.HashedModuleIdsPlugin(),
    // enable scope hoisting
    new webpack.optimize.ModuleConcatenationPlugin(),
    // copy custom static assets
    new CopyWebpackPlugin(
      browsers.map(browser => ({
        from: path.resolve(__dirname, '../static'),
        to: browser,
        ignore: ['.*']
      }))
    ),
  ].concat(browsers.map(browser => new GenerateJsonPlugin(
    browser + '/manifest.json',
    Object.assign({}, manifest, require(`../src/manifest/${browser}.manifest.json`), { version })
  )))
})

if (config.build.productionGzip) {
  const CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

if (config.build.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig

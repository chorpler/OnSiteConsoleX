/*
 * The webpack config exports an object that has a valid webpack configuration
 * For each environment name. By default, there are two Ionic environments:
 * "dev" and "prod". As such, the webpack.config.js exports a dictionary object
 * with "keys" for "dev" and "prod", where the value is a valid webpack configuration
 * For details on configuring webpack, see their documentation here
 * https://webpack.js.org/configuration/
 */
var path = require('path');
var webpack = require('webpack');
var ionicWebpackFactory = require(process.env.IONIC_WEBPACK_FACTORY);
var ModuleConcatPlugin = require('webpack/lib/optimize/ModuleConcatenationPlugin');
var PurifyPlugin = require('@angular-devkit/build-optimizer').PurifyPlugin;
var optimizedProdLoaders = [
  {
    test: /\.json$/,
    loader: 'json-loader'
  },
  {
    test: /\.js$/,
    loader: [
      {
        loader: process.env.IONIC_CACHE_LOADER
      },
      {
        loader: '@angular-devkit/build-optimizer/webpack-loader',
        options: {
          sourceMap: true
        }
      },
    ]
  },
  {
    test: /\.ts$/,
    loader: [
      {
        loader: process.env.IONIC_CACHE_LOADER
      },
      {
        loader: '@angular-devkit/build-optimizer/webpack-loader',
        options: {
          sourceMap: true
        }
      },
      {
        loader: process.env.IONIC_WEBPACK_LOADER
      }
    ]
  }
];
function getProdLoaders() {
  if (process.env.IONIC_OPTIMIZE_JS === 'true') {
    return optimizedProdLoaders;
  }
  return devConfig.module.loaders;
}
var devConfig = {
  entry: process.env.IONIC_APP_ENTRY_POINT,
  output: {
    path: '{{BUILD}}',
    publicPath: 'build/',
    filename: '[name].js',
    devtoolModuleFilenameTemplate: ionicWebpackFactory.getSourceMapperFunction(),
  },
  externals:
    [
      (function () {
        var IGNORES = ["fs", "child_process", "electron", "path", "assert", "cluster", "crypto", "dns", "domain", "events", "http", "https", "net", "os", "process", "punycode", "querystring", "readline", "repl", "stream", "string_decoder", "tls", "tty", "dgram", "url", "util", "v8", "vm", "zlib"];
        return function (context, request, callback) {
          if (IGNORES.indexOf(request) >= 0) {
            return callback(null, "require('" + request + "')");
          }
          return callback();
        };
      })()
      ],
    // {
    //   "fs": "require('fs')",
    //   "child_process": "require('child_process')",
    //   "electron": "require('electron')",
    //   "path": "require('path')",
    //   "assert": "require('assert')",
    //   "cluster": "require('cluster')",
    //   "crypto": "require('crypto')",
    //   "dns": "require('dns')",
    //   "domain": "require('domain')",
    //   "events": "require('events')",
    //   "http": "require('http')",
    //   "https": "require('https')",
    //   "net": "require('net')",
    //   "os": "require('os')",
    //   "process": "require('process')",
    //   "punycode": "require('punycode')",
    //   "querystring": "require('querystring')",
    //   "readline": "require('readline')",
    //   "repl": "require('repl')",
    //   "stream": "require('stream')",
    //   "string_decoder": "require('string_decoder')",
    //   "tls": "require('tls')",
    //   "tty": "require('tty')",
    //   "dgram": "require('dgram')",
    //   "url": "require('url')",
    //   "util": "require('util')",
    //   "v8": "require('v8')",
    //   "vm": "require('vm')",
    //   "zlib": "require('zlib')"
    // },
  devtool: process.env.IONIC_SOURCE_MAP_TYPE,
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    modules: [path.resolve('node_modules')]
  },
  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.ts$/,
        loader: process.env.IONIC_WEBPACK_LOADER
      }
    ]
  },
  plugins: [
    ionicWebpackFactory.getIonicEnvironmentPlugin(),
    ionicWebpackFactory.getCommonChunksPlugin()
  ],
  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  // node: {
  //   fs: 'empty',
  //   net: 'empty',
  //   tls: 'empty'
  // }
};
var prodConfig = {
  entry: process.env.IONIC_APP_ENTRY_POINT,
  output: {
    path: '{{BUILD}}',
    publicPath: 'build/',
    filename: '[name].js',
    devtoolModuleFilenameTemplate: ionicWebpackFactory.getSourceMapperFunction(),
  },
  externals:
    [
      (function () {
        var IGNORES = ["fs", "child_process", "electron", "path", "assert", "cluster", "crypto", "dns", "domain", "events", "http", "https", "net", "os", "process", "punycode", "querystring", "readline", "repl", "stream", "string_decoder", "tls", "tty", "dgram", "url", "util", "v8", "vm", "zlib"];
        return function (context, request, callback) {
          if (IGNORES.indexOf(request) >= 0) {
            return callback(null, "require('" + request + "')");
          }
          return callback();
        };
      })()
  ],
    // {
    //   "fs": "require('fs')",
    //   "child_process": "require('child_process')",
    //   "electron": "require('electron')",
    //   "path": "require('path')",
    //   "assert": "require('assert')",
    //   "cluster": "require('cluster')",
    //   "crypto": "require('crypto')",
    //   "dns": "require('dns')",
    //   "domain": "require('domain')",
    //   "events": "require('events')",
    //   "http": "require('http')",
    //   "https": "require('https')",
    //   "net": "require('net')",
    //   "os": "require('os')",
    //   "process": "require('process')",
    //   "punycode": "require('punycode')",
    //   "querystring": "require('querystring')",
    //   "readline": "require('readline')",
    //   "repl": "require('repl')",
    //   "stream": "require('stream')",
    //   "string_decoder": "require('string_decoder')",
    //   "tls": "require('tls')",
    //   "tty": "require('tty')",
    //   "dgram": "require('dgram')",
    //   "url": "require('url')",
    //   "util": "require('util')",
    //   "v8": "require('v8')",
    //   "vm": "require('vm')",
    //   "zlib": "require('zlib')"
    // },
  devtool: process.env.IONIC_SOURCE_MAP_TYPE,
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    modules: [path.resolve('node_modules')]
  },
  module: {
    loaders: getProdLoaders()
  },
  plugins: [
    ionicWebpackFactory.getIonicEnvironmentPlugin(),
    ionicWebpackFactory.getCommonChunksPlugin(),
    new ModuleConcatPlugin(),
    new PurifyPlugin()
  ],
  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    // fs: 'empty',
    // net: 'empty',
    // tls: 'empty'
  }
};
module.exports = {
  target: 'electron-renderer',
  dev: devConfig,
  prod: prodConfig,
}

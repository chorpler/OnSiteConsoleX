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

var providePlugin = new webpack.ProvidePlugin({
  $: "jquery",
  jQuery: "jquery",
  moment: "moment",
  fullCalendar: "fullcalendar",
});

var tsconfig = require('../tsconfig.json');

console.log("IONIC WEBPACK LOADER:\n", process.env.IONIC_WEBPACK_LOADER);

function srcPath(subdir) {
  return path.join(__dirname, "../src", subdir);
}

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
  externals: [
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
  devtool: process.env.IONIC_SOURCE_MAP_TYPE,

  resolve: {
    // alias: {
      // jquery: path.resolve(path.join(__dirname, 'node_modules', 'jquery')),
      // fullcalendar: path.resolve(path.join(__dirname, 'node_modules', 'fullcalendar/dist/fullcalendar')),
    // },
    alias: {
      app        : srcPath('app')        ,
      assets     : srcPath('assets')     ,
      components : srcPath('components') ,
      config     : srcPath('config')     ,
      directives : srcPath('directives') ,
      domain     : srcPath('domain')     ,
      pages      : srcPath('pages')      ,
      pipes      : srcPath('pipes')      ,
      providers  : srcPath('providers')  ,
    },
    extensions: ['.ts', '.js', '.json'],
    modules: [ path.resolve('node_modules'), path.resolve(tsconfig.compilerOptions.baseUrl) ]
  },

  module: {
    loaders: [
      {
        test: /zone-electron-fix\.ts$/,
        loader: 'ts-loader'
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.ts$/,
        loader: process.env.IONIC_WEBPACK_LOADER
      },
      {
        test: require.resolve('jquery'),
        loader: 'expose-loader?$!expose-loader?jQuery'
      },
      {
        test: require.resolve('moment'),
        loader: 'expose-loader?moment'
      },
      {
        test: require.resolve('fullcalendar'),
        loader: 'expose-loader?fullcalendar'
      },
      // {
      //   test: /\.(png|jpe?g|gif|svg|ico)$/,
      //   loader: 'file-loader?name=assets/images/[name].[hash].[ext]'
      // },
      // {
      //   test: /\.(|woff|woff2|ttf|eot|)$/,
      //   loader: 'file-loader?name=assets/fonts/[name].[hash].[ext]'
      // },
    ]
  },

  plugins: [
    ionicWebpackFactory.getIonicEnvironmentPlugin(),
    ionicWebpackFactory.getCommonChunksPlugin(),
    providePlugin,
  ],

  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }
};

var prodConfig = {
  entry: process.env.IONIC_APP_ENTRY_POINT,
  output: {
    path: '{{BUILD}}',
    publicPath: 'build/',
    filename: '[name].js',
    devtoolModuleFilenameTemplate: ionicWebpackFactory.getSourceMapperFunction(),
  },
  externals: [
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
  devtool: process.env.IONIC_SOURCE_MAP_TYPE,

  resolve: {
    alias: {
      app        : srcPath('app')        ,
      assets     : srcPath('assets')     ,
      components : srcPath('components') ,
      config     : srcPath('config')     ,
      directives : srcPath('directives') ,
      domain     : srcPath('domain')     ,
      pages      : srcPath('pages')      ,
      pipes      : srcPath('pipes')      ,
      providers  : srcPath('providers')  ,
    },
    extensions: ['.ts', '.js', '.json'],
    modules: [ path.resolve('node_modules'), path.resolve(tsconfig.compilerOptions.baseUrl) ]
  },

  module: {
    loaders: getProdLoaders()
  },

  plugins: [
    ionicWebpackFactory.getIonicEnvironmentPlugin(),
    ionicWebpackFactory.getCommonChunksPlugin(),
    new ModuleConcatPlugin(),
    new PurifyPlugin(),
    providePlugin,
  ],

  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }
};


module.exports = {
  dev: devConfig,
  prod: prodConfig
}

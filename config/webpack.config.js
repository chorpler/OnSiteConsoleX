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
// var PurifyPlugin = require('@angular-devkit/build-optimizer').PurifyPlugin;
// var webpack = require('webpack');
var CircularDependencyPlugin = require('circular-dependency-plugin');
var MomentLocalesPlugin = require('moment-locales-webpack-plugin');
var webpackConfig = require('@ionic/app-scripts/config/webpack.config');
var tsconfig = require('../tsconfig.json');
// var ionicWebpackFactory = require(process.env.IONIC_WEBPACK_FACTORY);
// var ModuleConcatPlugin = require('webpack/lib/optimize/ModuleConcatenationPlugin');

var providePlugin = new webpack.ProvidePlugin({
  // $: "jquery",
  // jQuery: "jquery",
  // moment: "moment",
  // fullCalendar: "fullcalendar",
});

console.log(`IONIC WEBPACK LOADER: "${process.env.IONIC_WEBPACK_LOADER}"`);

function srcPath(subdir) {
  return path.join(__dirname, "../src", subdir);
}

let CircDepPlugin = new CircularDependencyPlugin({
  // exclude detection of files based on a RegExp
  // exclude: /a\.js|node_modules/,
  exclude: /^a\.js$/,

  // add errors to webpack instead of warnings
  // failOnError: true,
  failOnError: false,

  // allow import cycles that include an asyncronous import,
  // e.g. via import(/* webpackMode: "weak" */ './file.js')
  allowAsyncCycles: false,

  // set the current working directory for displaying module paths
  cwd: process.cwd(),
});

// var IGNORES = ["fs", "child_process", "electron", "path", "assert", "cluster", "crypto", "dns", "domain", "events", "http", "https", "net", "os", "process", "punycode", "querystring", "readline", "repl", "stream", "string_decoder", "tls", "tty", "dgram", "url", "util", "v8", "vm", "zlib"];
var IGNORES = ["fs", "child_process", "electron", "path", "assert", "cluster", "crypto", "dns", "domain", "events", "http", "https", "net", "os", "process", "punycode", "querystring", "readline", "repl", "stream", "string_decoder", "tls", "tty", "dgram", "url", "util", "v8", "vm", "zlib"];
var DATABASES = [
  // "pouchdb",
  // "leveldown",
  "pouchdb-adapter-leveldb",
  "pouchdb-adapter-node-websql",
  // "pouchdb-adapter-websql",
  "websql"
];
// var workerLoaderConfig = {
//   test: /\.worker\.ts/,
//   loader: 'worker-loader',
//   options: {
//       name: 'WORKER.[name].js'
//   },
// };

var resolveConfig = {
  // alias: {
    // jquery: path.resolve(path.join(__dirname, 'node_modules', 'jquery')),
    // fullcalendar: path.resolve(path.join(__dirname, 'node_modules', 'fullcalendar/dist/fullcalendar')),
  // },
  symlinks: false,
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
    // workers    : srcPath('workers')    ,
  },
  extensions: ['.ts', '.js', '.json'],
  modules: [ path.resolve('node_modules'), path.resolve(tsconfig.compilerOptions.baseUrl) ]
};

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
      // var DATABASES = ["pouchdb", "leveldown"];
      return function (context, request, callback) {
        if(IGNORES.indexOf(request) >= 0) {
          return callback(null, "require('" + request + "')");
        }
        if(DATABASES.indexOf(request) > -1) {
          console.log("externals: found request: ", request);
          // return callback(null, "'" + request + "'");
          return callback(null, "require('" + request + "')");
          // return callback(null, request);
        }
        return callback();
      };
    })()
  ],
  devtool: process.env.IONIC_SOURCE_MAP_TYPE,

  resolve: resolveConfig,

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
      // {
      //   test: require.resolve('fullcalendar'),
      //   loader: 'expose-loader?fullcalendar'
      // },
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
    new MomentLocalesPlugin({
      localesToKeep: ['es-us', 'es'],
    }),
    ionicWebpackFactory.getIonicEnvironmentPlugin(),
    ionicWebpackFactory.getCommonChunksPlugin(),
    providePlugin,
    CircDepPlugin,
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
      return function (context, request, callback) {
        if(IGNORES.indexOf(request) >= 0) {
          return callback(null, "require('" + request + "')");
        }
        if(DATABASES.indexOf(request) > -1) {
          console.log("externals: found request: ", request);
          // return callback(null, "'" + request + "'");
          return callback(null, "require('" + request + "')");
          // return callback(null, request);
        }
        return callback();
      };
    })()
  ],
  devtool: process.env.IONIC_SOURCE_MAP_TYPE,

  resolve: resolveConfig,

  module: {
    loaders: getProdLoaders()
  },

  plugins: [
    new MomentLocalesPlugin({
      localesToKeep: ['es-us', 'es'],
    }),
    ionicWebpackFactory.getIonicEnvironmentPlugin(),
    ionicWebpackFactory.getCommonChunksPlugin(),
    new ModuleConcatPlugin(),
    // new PurifyPlugin(),
    providePlugin,
    CircDepPlugin,
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
};

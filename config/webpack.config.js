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
var DefinePlugin = webpack.DefinePlugin;
var ProvidePlugin = webpack.ProvidePlugin;
var ModuleConcatPlugin = require('webpack/lib/optimize/ModuleConcatenationPlugin');
var CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
var AggressiveSplittingPlugin = require('webpack/lib/optimize/AggressiveSplittingPlugin');
// var PurifyPlugin = require('@angular-devkit/build-optimizer').PurifyPlugin;
// var webpack = require('webpack');
var CircularDependencyPlugin = require('circular-dependency-plugin');
var IonicCommonChunksPlugin = ionicWebpackFactory.getCommonChunksPlugin();
var MomentLocalesPlugin = require('moment-locales-webpack-plugin');
var webpackConfig = require('@ionic/app-scripts/config/webpack.config');
var tsconfig = require('../tsconfig.json');
// var ionicWebpackFactory = require(process.env.IONIC_WEBPACK_FACTORY);
// var ModuleConcatPlugin = require('webpack/lib/optimize/ModuleConcatenationPlugin');

var NgxStoreConfigPlugin = new DefinePlugin({
  NGXSTORE_CONFIG: JSON.stringify({
    prefix: 'ngx_',      // default: 'ngx_'
    clearType: 'prefix', // default: 'prefix'
    mutateObjects: true, // default: true
    debugMode: false,    // you can enable debug logs if you ever meet any bug to localize its source
    cookiesScope: '',    // what you pass here will actually prepend base domain
    cookiesCheckInterval: 0, // number in ms describing how often cookies should be checked for changes
    previousPrefix: 'angular2ws_', // you have to set it only if you were using custom prefix in old version ('angular2ws_' is a default value)
  }),  
});

var providePlugin = new ProvidePlugin({
  // $: "jquery",
  // jQuery: "jquery",
  // moment: "moment",
  // fullCalendar: "fullcalendar",
});

var AgSplitPlugin = new AggressiveSplittingPlugin({
  minSize: 0,
  maxSize: 5000000,
});

var ComChunkPlugin1 =  new CommonsChunkPlugin({
  name: ['vendor'],
  filename: '[name].js',
  minChunks: (module, count) => {
    // let kys = Object.keys(module);
    // let keys = JSON.stringify(kys);
    // console.log(`CCPLUGIN1: Module is: `, keys);
    // let id = module && module.context ? module.context : "UNKNOWN_MODULE";
    // console.log(`CCPLUGIN1: Module is: `, id);
    let out = false;
    if(module) {
      out = true;
      let vals = {};
      let ctx = "", res = "", req = "", allStrings = "NONE";
      let keys = Object.keys(module);
      for(let key of keys) {
        let val = module[key];
        let valtype = typeof val;
        // if(valtype != 'undefined' && valtype !== 'object' && valtype !== 'function') {
        if(valtype === 'string') {
          vals[key] = val;
        }
      }
      allStrings = JSON.stringify(vals);
      if(typeof module.context === 'string') {
        ctx = module.context;
      }
      if(typeof module.request === 'string') {
        req = module.request;
      }
      if(typeof module.resource === 'string') {
        res = module.resource;
      }
      if(!(ctx && req)) {
        console.log(`CCPLUGIN1: WEIRD: '${allStrings}'\n`);
        out = true;
      } else {
        out = ctx.includes('node_modules') && !req.includes('pouchdb');
      }
    }
    return out;
  },
});
var ComChunkPlugin2 =  new CommonsChunkPlugin({
  name: 'pouchdb',
  chunks: ['vendor'],
  minChunks: (module, count) => {
    let out = false;
    if(module) {
      out = true;
      let vals = {};
      let ctx = "", res = "", req = "", allStrings = "NONE";
      let keys = Object.keys(module);
      for(let key of keys) {
        let val = module[key];
        let valtype = typeof val;
        // if(valtype != 'undefined' && valtype !== 'object' && valtype !== 'function') {
        if(valtype === 'string') {
          vals[key] = val;
        }
      }
      allStrings = JSON.stringify(vals);
      if(typeof module.context === 'string') {
        ctx = module.context;
      }
      if(typeof module.request === 'string') {
        req = module.request;
      }
      if(typeof module.resource === 'string') {
        res = module.resource;
      }
      if(!res) {
        console.log(` ==CCPLUGIN2: WEIRD: '${allStrings}'\n`);
        out = false;
      } else {
        out = (/node_modules(\\|\/)pouchdb/).test(res);
      }
    }
    return out;
  },
});

console.log(`IONIC WEBPACK LOADER: "${process.env.IONIC_WEBPACK_LOADER}"`);
console.log(`IONIC COMMON CHUNKS PLUGIN:`, IonicCommonChunksPlugin);

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
var IGNORES = ["fs", "child_process", "electron", "path", "assert", "cluster", "crypto", "dns", "domain", "events", "http", "https", "net", "os", "process", "punycode", "querystring", "readline", "repl", "stream", "string_decoder", "tls", "tty", "dgram", "url", "util", "v8", "vm", "zlib", "devtron"];
// var IGNORES = ["fs", "child_process", "electron", "path", "assert", "cluster", "dns", "domain", "events", "http", "https", "net", "os", "process", "punycode", "querystring", "readline", "repl", "stream", "string_decoder", "tls", "tty", "dgram", "url", "util", "v8", "vm", "zlib"];
var DATABASES = [
  // "pouchdb",
  // "leveldown",
  // "pouchdb-adapter-websql",
  // "crypto",
  "pouchdb-adapter-leveldb",
  "pouchdb-adapter-node-websql",
  "sqlite3",
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
      return function (context, request, callback) {
        if(IGNORES.indexOf(request) >= 0) {
          // if(request === 'crypto') {
          //   return callback(null, "require('crypto-browserify')");
          // } else {
            return callback(null, "require('" + request + "')");
          // }
        }
        if(DATABASES.indexOf(request) > -1) {
          console.log("externals: found request: ", request);
          // return callback(null, "'" + request + "'");
          // if(request === 'crypto') {
          //   return callback(null, "require('crypto-browserify')");
          // } else {
            return callback(null, "require('" + request + "')");
          // }
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
    NgxStoreConfigPlugin,
    new MomentLocalesPlugin({
      localesToKeep: ['es-us', 'es'],
    }),
    ionicWebpackFactory.getIonicEnvironmentPlugin(),
    // ionicWebpackFactory.getCommonChunksPlugin(),
    IonicCommonChunksPlugin,
    // ComChunkPlugin1,
    // ComChunkPlugin2,
    new ModuleConcatPlugin(),
    providePlugin,
    CircDepPlugin,
    // AgSplitPlugin,
    // new PurifyPlugin(),
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
          if(request === 'crypto') {
            return callback(null, "require('crypto-browserify')");
          } else {
            return callback(null, "require('" + request + "')");
          }
        }
        if(DATABASES.indexOf(request) > -1) {
          console.log("externals: found request: ", request);
          if(request === 'crypto') {
            return callback(null, "require('crypto-browserify')");
          } else {
            return callback(null, "require('" + request + "')");
          }
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
    NgxStoreConfigPlugin,
    new MomentLocalesPlugin({
      localesToKeep: ['es-us', 'es'],
    }),
    ionicWebpackFactory.getIonicEnvironmentPlugin(),
    // ionicWebpackFactory.getCommonChunksPlugin(),
    IonicCommonChunksPlugin,
    // ComChunkPlugin1,
    // ComChunkPlugin2,
    new ModuleConcatPlugin(),
    providePlugin,
    CircDepPlugin,
    // AgSplitPlugin,
    // new PurifyPlugin(),
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

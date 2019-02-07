let primeTheme = 'nova-light';
// let primeTheme = 'omega';
// let primeTheme = 'ludvig';
module.exports = {
  copyAssets: {
    src: ['{{SRC}}/assets/**/*'],
    dest: '{{WWW}}/assets'
  },
  copyAssetsToBuild: {
    src: ['{{SRC}}/assets/**/*'],
    dest: '{{BUILD}}/assets'
  },
  copyKeyCodeServiceConfigFile: {
    src: ['{{SRC}}/config/keyconfig.json5'],
    dest: '{{WWW}}/assets/config'
  },
  copyIndexContent: {
    // src: ['{{SRC}}/index.html', '{{SRC}}/manifest.json', '{{SRC}}/service-worker.js', '{{SRC}}/favicon.ico'],
    src: ['{{SRC}}/index.html', '{{SRC}}/manifest.json', '{{SRC}}/service-worker.js', '{{SRC}}/favicon.ico', '{{SRC}}/test.html'],
    dest: '{{WWW}}'
  },
  copyFonts: {
    src: ['{{ROOT}}/node_modules/ionicons/dist/fonts/**/*', '{{ROOT}}/node_modules/ionic-angular/fonts/**/*'],
    dest: '{{WWW}}/assets/fonts'
  },
  copyPolyfills: {
    src: ['{{ROOT}}/node_modules/ionic-angular/polyfills/polyfills.js'],
    dest: '{{BUILD}}'
  },
  copyFontawesomeFonts: {
    src: ['{{ROOT}}/node_modules/font-awesome/fonts/**/*'],
    dest: '{{WWW}}/assets/fonts'
  },
  copyFontawesomeCss: {
    src: ['{{SRC}}/assets/css/font-awesome.min.css'],
    dest: '{{WWW}}/assets/css'
  },
  copyPrimeNGCss: {
    src: [ '{{ROOT}}/node_modules/primeng/resources/*.css', '{{ROOT}}/node_modules/fullcalendar/dist/**/*', '{{ROOT}}/node_modules/primeicons/primeicons.css' ],
    // src: [ '{{ROOT}}/node_modules/primeng/resources/*.css', '{{ROOT}}/node_modules/primeicons/primeicons.css' ],
    dest: '{{WWW}}/assets/css'
  },
  copyPrimeNGTheme: {
    src: [`{{ROOT}}/node_modules/primeng/resources/themes/${primeTheme}/**/*`],
    dest: '{{WWW}}/assets/css'
  },
  copyPrimeFonts: {
    src: [ '{{ROOT}}/node_modules/primeicons/fonts/**/*' ],
    dest: '{{WWW}}/assets/css/fonts'
  },
  // copyPrimeNGThemeFonts: {
  //   src: [`{{ROOT}}/node_modules/primeng/resources/themes/${primeTheme}/fonts/*`],
  //   dest: '{{WWW}}/assets/fonts'
  // },
  // copyPrimeNGThemeImages: {
  //   src: [`{{ROOT}}/node_modules/primeng/resources/themes/${primeTheme}/images/*`],
  //   dest: '{{WWW}}/assets/images'
  // },
  // copyAngularCalendarCss: {
  //   src: ['{{ROOT}}/node_modules/angular-calendar/css/angular-calendar.css'],
  //   dest: '{{WWW}}/assets/css'
  // },
  copyScripts: {
    // src: ['{{ROOT}}/node_modules/jquery/dist/jquery.min.js', '{{ROOT}}/node_modules/moment/min/moment.min.js', '{{ROOT}}/node_modules/fullcalendar/dist/fullcalendar.min.js', '{{ROOT}}/node_modules/quill/dist/quill.js'],
    // src: ['{{ROOT}}/node_modules/jquery/dist/jquery.min.js', '{{ROOT}}/node_modules/fullcalendar/dist/fullcalendar.min.js', '{{ROOT}}/node_modules/quill/dist/quill.js'],
    src: ['{{ROOT}}/node_modules/fullcalendar/dist/fullcalendar.min.js', '{{ROOT}}/node_modules/quill/dist/quill.js'],
    // src: [ '{{ROOT}}/node_modules/quill/dist/quill.js' ],
    dest: '{{BUILD}}'
  },
  // copyMonacoAssets: {
  //   src: ['{{SRC}}}/assets/monaco/**/*', '{{ROOT}}/node_modules/ngx-monaco-editor/assets/monaco'],
  //   dest: '{{WWW}}/assets/monaco'
  // },
  copyQuillAssets: {
    src: ['{{ROOT}}/node_modules/quill/dist/*.css'],
    dest: '{{WWW}}/assets/css'
  },
  // copyJSONEditorAssets: {
  //   src: ['{{ROOT}}/node_modules/jsoneditor/dist/**/*'],
  //   dest: '{{WWW}}/assets/css'
  // },
  /* ELECTRON ADDITIONS */
  copyElectronAssets: {
    src: ['{{ROOT}}/resources/onsitexconsole.ico', '{{ROOT}}/resources/*.html', '{{ROOT}}/resources/electronsplash.png'],
    dest: '{{WWW}}/assets'
  },
  copyElectronAssetsAgain: {
    src: ['{{SRC}}/assets/**/*', '{{ROOT}}/resources/onsitexconsole.ico', '{{ROOT}}/resources/*.html', '{{ROOT}}/resources/electronsplash.png'],
    dest: '{{BUILD}}/assets'
  },
  copyElectronIndexContents: {
    src: ['{{ROOT}}/resources/onsitexconsole.ico', '{{ROOT}}/resources/*.html', '{{ROOT}}/resources/electronsplash.png'],
    dest: '{{WWW}}'
  },
  copyElectronZoneJSFix: {
    src: ['{{SRC}}/config/zonejs-electron-fix.js'],
    dest: '{{BUILD}}'
  },
  copyElectronHTML: {
    src: ['{{ROOT}}/autoupdate/**/*'],
    dest: '{{WWW}}'
  },
  // copyElectronSearch: {
  //   // src: ['{{SRC}}/lib/search-window.*', '{{SRC}}/lib/default*'],
  //   src: ['{{ROOT}}/lib/search-window.*', '{{ROOT}}/lib/default*'],
  //   dest: '{{WWW}}'
  // },
  copyElectronPDFJSViewer: {
    src: ['{{ROOT}}/pdfjs/**/*'],
    dest: '{{WWW}}/pdfjs'
  },
  // copyElectronChildProcessFile: {
  //   src: ['{{ROOT}}/electron/child.js'],
  //   dest: '{{WWW}}'
  // },
  copyPouchDB: {
    // src: ['{{ROOT}}/node_modules/pouchdb/dist/pouchdb*.js', '{{ROOT}}/node_modules/pouchdb-upsert/dist/pouchdb*.js'],
    // src: ['{{ROOT}}/node_modules/pouchdb/dist/pouchdb.js', '{{ROOT}}/node_modules/pouchdb/dist/pouchdb.min.js'],
    src: ['{{ROOT}}/pouchdb/pouchdb.js', '{{ROOT}}/pouchdb/pouchdb.min.js'],
    dest: '{{BUILD}}'
  },
  // copyPouchDBAdaptersNodeWebSql: {
  //   // src: ['{{ROOT}}/node_modules/pouchdb/dist/pouchdb*.js', '{{ROOT}}/node_modules/pouchdb-upsert/dist/pouchdb*.js'],
  //   src: ['{{ROOT}}/node_modules/pouchdb-adapter-node-websql/lib/*'],
  //   dest: '{{BUILD}}/pouchdb-adapter-node-websql'
  // },
  // copyPouchDBAdaptersWebSql: {
  //   // src: ['{{ROOT}}/node_modules/pouchdb/dist/pouchdb*.js', '{{ROOT}}/node_modules/pouchdb-upsert/dist/pouchdb*.js'],
  //   src: ['{{ROOT}}/node_modules/pouchdb-adapter-websql/lib/*'],
  //   dest: '{{BUILD}}/pouchdb-adapter-websql'
  // },
  // copyPouchDBAdaptersWebSqlCore: {
  //   // src: ['{{ROOT}}/node_modules/pouchdb/dist/pouchdb*.js', '{{ROOT}}/node_modules/pouchdb-upsert/dist/pouchdb*.js'],
  //   src: ['{{ROOT}}/node_modules/pouchdb-adapter-websql-core/lib/*'],
  //   dest: '{{BUILD}}/pouchdb-adapter-websql-core'
  // },
  // copyPouchDBAdaptersLevelDB: {
  //   // src: ['{{ROOT}}/node_modules/pouchdb/dist/pouchdb*.js', '{{ROOT}}/node_modules/pouchdb-upsert/dist/pouchdb*.js'],
  //   src: ['{{ROOT}}/node_modules/pouchdb-adapter-websql-core/lib/*'],
  //   dest: '{{BUILD}}/pouchdb-adapter-websql-core'
  // },
  // copyPouchDB2: {
    //   src: ['{{ROOT}}/node_modules/pouchdb/dist/pouchdb*.js', '{{ROOT}}/node_modules/pouchdb-upsert/dist/pouchdb*.js'],
    // dest: '{{WWW}}'
  // },
};

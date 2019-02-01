module.exports = {
  copyAssets: {
      src: ['{{SRC}}/assets/**/*'],
      dest: '{{WWW}}/assets'
  },
  copyIndexContent: {
      src: ['{{SRC}}/index.html', '{{SRC}}/manifest.json', '{{SRC}}/service-worker.js'],
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
      src: ['{{ROOT}}/node_modules/font-awesome/css/font-awesome.min.css'],
      dest: '{{WWW}}/assets/css'
  },
  copyPrimeNGCss: {
      src: ['{{ROOT}}/node_modules/primeng/resources/primeng.min.css', '{{ROOT}}/node_modules/fullcalendar/dist/fullcalendar.min.css'],
      dest: '{{WWW}}/assets/css'
  },
  copyPrimeNGThemeCss: {
      src: ['{{ROOT}}/node_modules/primeng/resources/themes/omega/theme.css'],
      dest: '{{WWW}}/assets/css'
  },
  copyPrimeNGThemeFonts: {
      src: ['{{ROOT}}/node_modules/primeng/resources/themes/omega/fonts/*'],
      dest: '{{WWW}}/assets/css/fonts'
  },
  copyFullCalendar: {
    src: ['{{ROOT}}/node_modules/jquery/dist/jquery.min.js', '{{ROOT}}/node_modules/moment/min/moment.min.js', '{{ROOT}}/node_modules/fullcalendar/dist/fullcalendar.min.js'],
    dest: '{{BUILD}}'
  }
}

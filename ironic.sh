echo Removing www and starting ionic serve...
#cd ~/code/OnSiteConsoleX
if [ -e package-lock.json ]; then
  rm -f package-lock.json
fi
# cp -f moment.d.ts node_modules/moment/
# cp -f pouchdb-authentication.utils.js node_modules/pouchdb-authentication/lib/utils.js
# cp -f worker-pouch.utils.js node_modules/worker-pouch/lib/shared/utils.js
# cp -f twix.d.ts node_modules/@types/twix/index.d.ts
# cp -f electron-in-page-search/index.d.ts node_modules/electron-in-page-search
if [ ! -e node_modules/@fortawesome ]; then
  # node sass-custom.js; npm install; ionic serve -p 8101 -r 35730 --address 0.0.0.0 --browser "google chrome"
  npm install @fortawesome/fontawesome-svg-core @fortawesome/fontawesome-pro @fortawesome/free-solid-svg-icons @fortawesome/angular-fontawesome @fortawesome/free-brands-svg-icons @fortawesome/free-regular-svg-icons @fortawesome/pro-solid-svg-icons @fortawesome/pro-regular-svg-icons @fortawesome/pro-light-svg-icons; ionic serve -p 8101 -r 35730  --dev-logger-port 53704 --address 0.0.0.0 --browser "google chrome"
else
  if [ -e src ]; then
    if [ -e www ]; then
      rm -rf www
    fi
    # cp -f moment.d.ts node_modules/moment/
    # cp -f pouchdb-authentication.utils.js node_modules/pouchdb-authentication/lib/utils.js
    # node sass-custom.js; ionic serve -p 8101 -r 35730 --address 0.0.0.0 --browser "google chrome"
    ionic serve -p 8101 -r 35730 --address 0.0.0.0  --dev-logger-port 53704 --browser "google chrome"
  else
    echo You need to be in the project directory to run this. Wait, how the hell are you executing this? You should never see this. You know what? I'm out, dude. I'm out. Game over, man, game over.
  fi
fi

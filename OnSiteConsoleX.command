echo Removing www and starting ionic serve...
#cd ~/code/OnSiteConsoleX
if [ -e package-lock.json ]; then
  rm -f package-lock.json
fi
cp -f worker-pouch.utils.js node_modules/worker-pouch/lib/shared/utils.js
cp -f twix.d.ts node_modules/@types/twix/index.d.ts
cp -f electron-in-page-search/index.d.ts node_modules/electron-in-page-search
if [ ! -e node_modules/@types/twix ]; then
  # node sass-custom.js; npm install; ionic serve -p 8101 -r 35730 --address 0.0.0.0 --browser "google chrome"
  npm install --save @types/twix; ionic serve -p 8101 -r 35730 --dev-logger-port 53704 --address 0.0.0.0 --browser "google chrome"
else
  # node sass-custom.js; ionic serve -p 8101 -r 35730 --address 0.0.0.0 --browser "google chrome"
  ionic serve -p 8101 -r 35730 --address 0.0.0.0 --dev-logger-port 53704 --browser "google chrome"
fi

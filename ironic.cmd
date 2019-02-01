@echo off
cls
echo Removing www directory (if it exists) ...
rd /s/q www
echo Deleting package.lock (if it exists) ...
del package-lock.json
REM xcopy moment.d.ts node_modules\moment /y
REM xcopy pouchdb-authentication.utils.js node_modules\pouchdb-authentication\lib\utils.js /y
REM xcopy worker-pouch.utils.js node_modules\worker-pouch\lib\shared\utils.js /y
REM xcopy twix.d.ts node_modules\@types\twix\index.d.ts /y
REM xcopy electron-in-page-search\index.d.ts node_modules\electron-in-page-search /y
rem choice /t 5 /d Y
echo Checking if new plugins need installing...
REM powershell -c (New-Object Media.SoundPlayer ".\ironic01.wav").PlaySync()
REM start sass --scss --no-cache --watch src\assets\css\printpage.scss:src\assets\css\printpage.css
if not exist node_modules\@fortawesome (
  echo Installing new plugins...
  npm i @fortawesome/fontawesome-svg-core @fortawesome/fontawesome-pro @fortawesome/free-solid-svg-icons @fortawesome/angular-fontawesome @fortawesome/free-brands-svg-icons @fortawesome/free-regular-svg-icons @fortawesome/pro-solid-svg-icons @fortawesome/pro-regular-svg-icons @fortawesome/pro-light-svg-icons & ionic serve -p 8110 -r 35739 --dev-logger-port 53713 --no-open %1 %2 %3 %4 %5 %6 %7 %8 %9
  REM npm install --save @types/twix && ionic serve -p 8101 -r 35730 --dev-logger-port 53704 --no-open
  REM node sass-custom.js & npm install & ionic serve -p 8101 -r 35730
  REM npm install --save promise-worker monaco-editor ngx-clipboard worker-pouch & ionic serve -p 8101 -r 35730
  REM npm install --save mousetrap & ionic serve -p 8101 -r 35730
) else (
  echo No plugins need installing.
  REM ionic serve -p 8101 -r 35730 --address 0.0.0.0
  REM node sass-custom.js & ionic serve -p 8101 -r 35730
  ionic serve -p 8110 -r 35739 --dev-logger-port 53713 --no-open %1 %2 %3 %4 %5 %6 %7 %8 %9
)

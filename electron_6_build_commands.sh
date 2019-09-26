export LDFLAGS=-L/usr/local/opt/sqlite/lib
export CPPFLAGS=-I/usr/local/opt/sqlite/include
export PKG_CONFIG_PATH=/usr/local/opt/sqlite/lib/pkgconfig
npm install sqlite3 --build-from-source --sqlite_libname=sqlcipher --sqlite=`brew --prefix` --runtime=electron --target=6.0.10 --dist-url=https://atom.io/download/electron
npm install leveldown --build-from-source --runtime=electron --dist-url=https://atom.io/download/electron
npm rebuild post-install
cd node_modules/node-sass
npm i
cd ../..


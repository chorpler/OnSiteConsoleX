- ### BUILD ERROR 001
  ```js
  // C:\code\tron\OnSiteConsoleX>node_modules\.bin\electron-rebuild
  × Rebuild Failed

  An unhandled error occurred inside electron-rebuild
  gyp info it worked if it ends with ok
  gyp info using node-gyp@3.8.0
  gyp info using node@9.11.2 | win32 | x64
  gyp ERR! clean error
  gyp ERR! stack Error: EPERM: operation not permitted, unlink 'C:\code\tron\OnSiteConsoleX\node_modules\pouchdb-adapter-leveldb\node_modules\leveldown\build\Release\leveldown.node'
  gyp ERR! System Windows_NT 10.0.17763
  gyp ERR! command "C:\\Program Files\\nodejs\\node.exe" "C:\\code\\tron\\OnSiteConsoleX\\node_modules\\node-gyp\\bin\\node-gyp.js" "rebuild" "--target=4.0.2" "--arch=x64" "--dist-url=https://atom.io/download/electron" "--build-from-source"
  gyp ERR! cwd C:\code\tron\OnSiteConsoleX\node_modules\pouchdb-adapter-leveldb\node_modules\leveldown
  gyp ERR! node -v v9.11.2
  gyp ERR! node-gyp -v v3.8.0
  gyp ERR! not ok

  Failed with exit code: 1

  Error: gyp info it worked if it ends with ok
  gyp info using node-gyp@3.8.0
  gyp info using node@9.11.2 | win32 | x64
  gyp ERR! clean error
  gyp ERR! stack Error: EPERM: operation not permitted, unlink 'C:\code\tron\OnSiteConsoleX\node_modules\pouchdb-adapter-leveldb\node_modules\leveldown\build\Release\leveldown.node'
  gyp ERR! System Windows_NT 10.0.17763
  gyp ERR! command "C:\\Program Files\\nodejs\\node.exe" "C:\\code\\tron\\OnSiteConsoleX\\node_modules\\node-gyp\\bin\\node-gyp.js" "rebuild" "--target=4.0.2" "--arch=x64" "--dist-url=https://atom.io/download/electron" "--build-from-source"
  gyp ERR! cwd C:\code\tron\OnSiteConsoleX\node_modules\pouchdb-adapter-leveldb\node_modules\leveldown
  gyp ERR! node -v v9.11.2
  gyp ERR! node-gyp -v v3.8.0
  gyp ERR! not ok

  Failed with exit code: 1
      at SafeSubscriber._error (C:\code\tron\OnSiteConsoleX\node_modules\spawn-rx\lib\src\index.js:277:84)
      at SafeSubscriber.__tryOrUnsub (C:\code\tron\OnSiteConsoleX\node_modules\spawn-rx\node_modules\rxjs\Subscriber.js:242:16)
      at SafeSubscriber.error (C:\code\tron\OnSiteConsoleX\node_modules\spawn-rx\node_modules\rxjs\Subscriber.js:201:26)
      at Subscriber._error (C:\code\tron\OnSiteConsoleX\node_modules\spawn-rx\node_modules\rxjs\Subscriber.js:132:26)
      at Subscriber.error (C:\code\tron\OnSiteConsoleX\node_modules\spawn-rx\node_modules\rxjs\Subscriber.js:106:18)
      at MapSubscriber.Subscriber._error (C:\code\tron\OnSiteConsoleX\node_modules\spawn-rx\node_modules\rxjs\Subscriber.js:132:26)
      at MapSubscriber.Subscriber.error (C:\code\tron\OnSiteConsoleX\node_modules\spawn-rx\node_modules\rxjs\Subscriber.js:106:18)
      at SafeSubscriber._next (C:\code\tron\OnSiteConsoleX\node_modules\spawn-rx\lib\src\index.js:251:65)
      at SafeSubscriber.__tryOrSetError (C:\code\tron\OnSiteConsoleX\node_modules\spawn-rx\node_modules\rxjs\Subscriber.js:251:16)
      at SafeSubscriber.next (C:\code\tron\OnSiteConsoleX\node_modules\spawn-rx\node_modules\rxjs\Subscriber.js:191:27)
  ```
  ### SOLUTION:
  Use task manager to kill any `electron.exe` and `node.exe` processes that are running. You may have to manually delete the `Release` directory and the `leveldown.node` file it contains.

  ### EXPLANATION
  The app is still running, probably in the background (development version, usually), and has that binary file locked.





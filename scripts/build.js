const sys  = require('sys');
const exec = require('child_process').exec;
const os   = require('os');

function puts(error, stdout, stderr) {
  sys.puts(stdout);
}

// Run command depending on OS

let type = os.type();

if(type === 'Linux') {
  exec("node build-linux.js", puts); 
} else if (type === 'Darwin') {
  exec("node build-mac.js", puts);
} else if (type === 'Windows_NT')  {
  exec("node build-windows.js", puts);
} else {
  let text = `Unsupported OS found: '${type}'`;
  let err = new Error(text);
  throw err;
}
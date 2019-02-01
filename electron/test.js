const WHATWG  = require('whatwg-url');
const URL     = WHATWG.URL;
const fspath  = require('path');
const process = require('process');

const icon_file_name     = 'onsitexconsole.ico';
const splash_screen_name = 'splash-screen.html';
const index_file_name    = 'index.html';
const update_file_name   = 'version.html';

function getWWWPath(file_name) {
  let filename = file_name ? file_name : icon_file_name;
  // console.log(`getWWWPath(): Checking for '${filename}' in path '${__dirname}'`);
  let relative_path = filename;
  let first = filename.slice(0,1);
  if(first !== '/' && first !== '.') {
    relative_path = fspath.join('..', 'www', filename);
  }
  // let file_path = fspath.join(__dirname, relative_path);
  console.log(`getWWWPath(): Path is '${relative_path}'`)
  return relative_path;
  // } else {
  //   return filename;
  // }
}

function getFilePath(filename) {
  let path1 = __dirname;
  if(filename.indexOf(path1) > -1 || filename.indexOf('app.asar') > -1) {
    return filename;
  } else {
    let fullPath = fspath.join(__dirname, filename);
    return fullPath;
  }
}

// function getFilePathAsURL(filename) {
//   try {
//     let fullPath = getFilePath(filename);
//     console.log(`getFilePathAsURL(): Now trying to get file path for filename '${filename}', full path '${fullPath}'`);
//     if(fullPath.slice(0, 7) !== 'file://') {
//       fullPath = "file://" + fullPath;
//     }
//     let parsedURL = WHATWG.parseURL(fullPath);
//     if(!(parsedURL && parsedURL.scheme)) {
//       console.log(`getFilePathAsURL(): ERROR! could not parse full path as URL!`);
//       return null;
//     } else {
//       // let fileURL = parsedURL;
//       let fileURL = fullPath;
//       if(!parsedURL.scheme === 'file') {
//         let prefix = "file://";
//         if(fullPath.slice(0,1) !== '/') {
//           prefix += "/";
//         }
//         let newURL = new URL(`${prefix}${fullPath}`);
//         fileURL = newURL.href;
//       }
//       return fileURL;
//     }
//   } catch(err) {
//     console.log(`getFilePathAsURL(): Error getting URL from '${filename}'`);
//     console.error(err);
//     // throw new Error(err);
//   }
// }

function getFilePathAsURL(filename) {
  try {
    let fullPath = getFilePath(filename);
    console.log(`getFilePathAsURL(): Now trying to get file path for filename '${filename}', full path '${fullPath}'`);
    if(fullPath.slice(0, 7) !== 'file://') {
      fullPath = "file://" + fullPath;
    }
    let parsedURL = WHATWG.parseURL(fullPath);
    if(!(parsedURL && parsedURL.scheme)) {
      console.log(`getFilePathAsURL(): ERROR! could not parse full path as URL!`);
      return null;
    } else {
      // let fileURL = parsedURL;
      let fileURL = fullPath;
      if(parsedURL.scheme === 'file') {
        let newURL = new URL(`${fullPath}`);
        fileURL = newURL.href;
      } else {
        let prefix = "file://";
        if(fullPath.slice(0,1) !== '/') {
          prefix += "/";
        }
        let newURL = new URL(`${prefix}${fullPath}`);
        fileURL = newURL.href;
      }
      return fileURL;
    }
  } catch(err) {
    console.log(`getFilePathAsURL(): Error getting URL from '${filename}'`);
    console.error(err);
    // throw new Error(err);
  }
}

// const icon_name = '/../www/onsitexconsole.ico';
const icon_name = getWWWPath(icon_file_name);
const icon_path = getFilePath(icon_name);
// console.log(`ICON PATH: '${icon_path}'`);
const icon_url  = getFilePathAsURL(icon_name);

let splash_location = getWWWPath(splash_screen_name);
let splashURL = getFilePathAsURL(splash_location);

let update_location = getWWWPath(update_file_name);
let updateURL = getFilePathAsURL(update_location);

let index_location = getWWWPath(index_file_name);
let index_url = getFilePathAsURL(index_location)

console.log(`ICON   URL: '${icon_url}'`)
console.log(`SPLASH URL: '${splashURL}'`)
console.log(`INDEX  URL: '${index_url}'`)
console.log(`UPDATE URL: '${updateURL}'`)

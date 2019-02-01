var inFile = "./src/assets/css/printpage.scss";
var outFile = "./src/assets/css/printpage.css";

var sass = require('node-sass');
var fs = require('fs');

var result = sass.render({
  file: inFile,
  outFile: outFile
}, function(error, result) {
  if(!error){
    var filename = outFile;
    console.log("Writing to: " + filename);
    // No errors during the compilation, write this result on the disk
    fs.writeFile(outFile, result.css, function(err) {
      if(!err){
        console.log("Successfully wrote file '" + filename + "'.");
        //file written on disk
      } else {
        console.log("Error writing file '" + filename + "':\n", err.message);
      }
    });
  }
});

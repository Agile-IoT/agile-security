var fs = require('fs');
var express = require('express');

function loadStrategies(files, conf) {
  var router = express.Router();
  console.log("registering express paths for successful installed strategies from routes/providers files  " + JSON.stringify(files));
  files.forEach(function (file) {
    if (file != "index.js")
      require('./' + file)(router, conf);
  });
  return router;
}
module.exports = loadStrategies;

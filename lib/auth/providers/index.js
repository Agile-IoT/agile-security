var fs = require('fs');

function loadStrategies(conf, agile_idm_core_conf) {
  var files = fs.readdirSync(__dirname);
  var strategies = [];
  files.forEach(function (file) {
    if (file != "index.js")
      if (require('./' + file)(conf, agile_idm_core_conf) === true)
        strategies.push(file);
  });
  return strategies;

}
module.exports = loadStrategies;

var fs = require('fs');

function loadStrategies(conf, agile_idm_core_conf) {

  fs.readdir(__dirname, function(err, files){
     files.forEach(function(file){
       if(file != "index.js")
        require('./'+file)(conf, agile_idm_core_conf);

    });
  })


}
module.exports = loadStrategies;

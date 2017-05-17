var wrapper = function(conf){
  var cors = require('cors');
  var whitelist = conf.cors?conf.cors:[];
  var corsOptions = {
    allowedHeaders: ['Content-Type', 'Authorization','Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
    methods: ['GET', 'PUT', 'POST','DELETE'],
    exposedHeaders: ['Access-Control-Allow-Origin'],
    origin: function (origin, callback) {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'),false);
      }
    }

  }
  return cors(corsOptions);
}
module.exports = wrapper;

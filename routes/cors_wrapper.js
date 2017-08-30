var wrapper = function(conf){
  var cors = require('cors');
  var whitelist = conf.cors?conf.cors:[];

  //enable CORS to point to the own host by env variable if needed...
  //this allows the cors array to have something like "http://set-automatically:2000"

  whitelist = whitelist.map(function(origin) {
      if(origin.indexOf("set-automatically") >=0 && process.env.AGILE_HOST){
        return origin.replace("set-automatically",process.env.AGILE_HOST);
      }
      else{
        return origin;
      }
  })

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

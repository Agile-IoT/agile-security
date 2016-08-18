var db = null;
var TokenStorage = require('./token-storage');
var conf = require('../conf/agile-ui-conf');
//This module just exposes one single instance of sqlite everywhere...
var promise  = new Promise(function (resolve, reject){
    if(db){
      return resolve(db);
    }
    else{
      db = new TokenStorage();
      db.init(conf['token-storage'], function(result){
           if(result.success){
               return resolve(db);
           }
           else{
               reject(new Error("error:"+result.error));
           }
       });
    }
});

module.exports = promise;

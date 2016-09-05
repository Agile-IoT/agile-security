var db = null;
var TokenStorage = require('./token-storage');
//This module just exposes one single instance of sqlite everywhere...


function loadDb(conf){
  var promisse  = new Promise(function (resolve, reject){
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
   return promisse;
  }
module.exports = loadDb;

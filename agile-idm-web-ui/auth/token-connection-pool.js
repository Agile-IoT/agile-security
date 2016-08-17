var db = null;
var TokenStorage = require('./token-storage');
//This module just exposes one single instance of sqlite everywhere...
module.exports = function(cb,conf){

  if(db){
    return cb(db);
  }
  else{
    db = new TokenStorage();
    db.init(conf, function(result){
         if(result.success){
             return cb(db);
         }
	 else{
          throw new Error("error:"+result.error);
         }
    });
  }
}

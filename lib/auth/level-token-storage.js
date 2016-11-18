var createError = require('http-errors');
var console = require('../log.js');
var level = require('level');
var transaction = require('level-transactions');

var TokenStorage = function () {

};


//initialize
TokenStorage.prototype.init =function (conf, onInitFinished){
  var that = this;
  var filename = conf.dbName;
  //onInitFinished({"success":true});
  var options = {
    keyEncoding: 'json',
    valueEncoding: 'json'
  };
  that.tokens = level(filename+"_tokens",options,function (err, db) {
        if (err) throw createError(500, "unexpected error"+err);
        else
          onInitFinished({"success":true});
  });

  //onInitFinished({"success":false,"error":reason});
/*
   var filename = conf.dbName;
	 if(filename && filename != null && filename !=""){
	      if("readOnly" in conf && conf["readOnly"]){
		       this.storage = new sqlite3.Database(filename,sqlite3.OPEN_READONLY,this.createTables.bind(this,onInitFinished));
        }else{
		       this.storage = new sqlite3.Database(filename,this.createTables.bind(this,onInitFinished));
       }
   }
  else{
       console.error("not enough parameters provided for Token Storage initialization");
       return;
  }*/
};

//returns an object with success field with true or false. when success == false then the returned object also has an error message.
//token needs at least the following attributes: 'token', "scope", "token_type", "auth_type","user_id"
// then additional parameters in the token argument are: "expiration"
TokenStorage.prototype.storeToken = function (token_id, token, onStorageTokenFinished) {
  console.log("arguments for storeToken "+JSON.stringify(arguments));
   var that = this;
   //token.token && token.scope && token.token_type && token.user_name && token.auth_type && token.expiration
   if(token.token && token.scope && token.token_type && token.auth_type) {
     console.log('putting token ');
     that.tokens.put(token_id, token, function (error) {
       console.log('result of put: error '+error);
       if(error)
        onStorageTokenFinished({success:false, error: createError(500, "unexpected error while storing token with id "+token_id+" and value "+JSON.stringify(token)+error)});
       else
         onStorageTokenFinished({success:true});

     });
   }
   else{
     onStorageTokenFinished({success:false, error: createError(500,"unexpected format for token")});
   }
	// token['token'], token["scope"], token["token_type"], token["auth_type"],token["user_id"], token["expiration"], token["refresh_token"]
};


// returns an object with success (false or true). and when success is true, an additional element in the obkect (data) is present with the selected row of the DB.
TokenStorage.prototype.getTokenByUser = function (userId,onStorageTokenFinishedCallback){
    var that = this;
    that.tokens.get(userId, function (error, value) {
     if(error)
        onStorageTokenFinishedCallback({success:false, error: createError(500, "unexpected error while retrieving token with user "+JSON.stringify(userId)+error)});
		else
      onStorageTokenFinishedCallback({"success":true, "data":value});
    });
};

// returns an object with success (false or true). and when success is true, an additional element in the obkect (data) is present with the selected row of the DB.
TokenStorage.prototype.getTokenByToken = function (token,callback){
  var array = [];
  var that = this;
  that.tokens.createReadStream()
    .on('data', function (data) {
      console.log('processing token info '+JSON.stringify(data))
      if(data.value.token === token)
         array.push(data.value);
    })
    .on('error', function (err) {
      callback({success:false, error:createError(500,"unexpected error while reading stream"+err)});
    })
    .on('end', function () {
      if(array.length === 0)
         callback ({success:false, error:createError(500,"no token object found for token"+token)});
      else
        callback({success:true, data: array[0]});
    });
};


module.exports = TokenStorage;

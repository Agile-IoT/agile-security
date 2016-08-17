var sqlite3 = require('sqlite3').verbose();

var TokenStorage = function () {


};
TokenStorage.prototype.createTables = function(onInitFinished, error){

    if(error){
         console.error("fatal error. Token Database could  not be opened: "+error);
         onInitFinished({"success":false,"error":error});
    }
    else{
          this.storage.run("CREATE TABLE IF NOT EXISTS token (id TEXT PRIMARY KEY, cookie TEXT NOT NULL, token TEXT NOT NULL, scope TEXT, token_type TEXT, auth_type TEXT NOT NULL, userId TEXT NOT NULL, expiration DATETIME DEFAULT 0, Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)",
                            function(error){
                                    if(error!=null){
                                        console.error("fatal error. Token table could not be created: "+error);
                                        onInitFinished({"success":false,"error":error});
                                    }else{
                                        this.prepareStatements(onInitFinished);
                                    }
                            }.bind(this));
    }
}

//statements
TokenStorage.prototype.prepareStatements = function(onInitFinished,error){
   //console.log('preparing token query statments');

   function promisseHandle(resolve, reject, error){
     if(error){
       reject(error);
     }
     else
      resolve();
   }

   var promisses = [
   new Promise(function (resolve, reject){
       this.store_token_statement= this.storage.prepare("INSERT INTO token  (id , cookie , token , scope , token_type , auth_type,userId, expiration ) VALUES(?, ?, ?, ?, ?, ?,?,?)", promisseHandle.bind(this,resolve,reject));
   }.bind(this)),
   new Promise((resolve, reject) => {
     this.get_token_by_id_statement = this.storage.prepare("SELECT id , cookie , token , scope , token_type , auth_type from token WHERE id =?", promisseHandle.bind(this,resolve,reject));
   }),
   new Promise((resolve, reject) => {
     this.get_token_by_cookie_id_statement = this.storage.prepare("SELECT id , cookie , token , scope , token_type , auth_type,userId, expiration  from token WHERE cookie =?", promisseHandle.bind(this,resolve,reject));
   }),
   new Promise((resolve, reject) => {
     this.get_token_by_token_statement = this.storage.prepare("SELECT id , cookie , token , scope , token_type , auth_type,userId, expiration  from token WHERE token =?", promisseHandle.bind(this,resolve,reject));
   }),
   new Promise((resolve, reject) => {
     this.get_token_by_user_id = this.storage.prepare("SELECT id , cookie , token , scope , token_type , auth_type,userId, expiration  from token WHERE userId =?", promisseHandle.bind(this,resolve,reject));
   })]

	Promise.all(promisses).then(function(results){onInitFinished({"success":true});}, function(reason){onInitFinished({"success":false,"error":reason});});

}


//initialize
TokenStorage.prototype.init =function (conf, onInitFinished){

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
  }
}

//returns an object with success field with true or false. when success == false then the returned object also has an error message.
//token needs at least the following attributes: 'token', "scope", "token_type", "auth_type","user_id"
// then additional parameters in the token argument are: "expiration"
TokenStorage.prototype.storeToken = function (token_id, auth_type, token,onStorageTokenFinished) {
  //console.log(JSON.stringify(arguments));
	this.store_token_statement.run(token_id, token_id, token['token'], token["scope"], token["token_type"], token["auth_type"],token["user_id"], token["expiration"], onStorageFinished.bind(this,onStorageTokenFinished));

        function onStorageFinished(onStorageTokenFinishedCallback, error){
		if(error){
			onStorageTokenFinishedCallback({"success":false,"error":JSON.stringify(error)});
		}
		else{
			onStorageTokenFinishedCallback({"success":true});
		}

	}

}


// returns an object with success (false or true). and when success is true, an additional element in the obkect (data) is present with the selected row of the DB.
TokenStorage.prototype.getTokenByUserId = function (userId,onStorageTokenFinishedCallback){



        function onStorageFinished(onStorageTokenFinishedCallback, error, row){

		if(error){
			onStorageTokenFinishedCallback({"success":false,"error":JSON.stringify(error)});
		}
	        else if(!row){
			onStorageTokenFinishedCallback({"success":false,"error":"no data found"});
		}
		else{
			onStorageTokenFinishedCallback({"success":true, "data":row});
		}

	}

      this.get_token_by_user_id.get(userId, onStorageFinished.bind(this,onStorageTokenFinishedCallback));
}

// returns an object with success (false or true). and when success is true, an additional element in the obkect (data) is present with the selected row of the DB.
TokenStorage.prototype.getTokenByToken = function (token,onStorageTokenFinishedCallback){



        function onStorageFinished(onStorageTokenFinishedCallback, error, row){

		if(error){
			onStorageTokenFinishedCallback({"success":false,"error":JSON.stringify(error)});
		}
	        else if(!row){
			onStorageTokenFinishedCallback({"success":false,"error":"no data found"});
		}
		else{
			onStorageTokenFinishedCallback({"success":true, "data":row});
		}

	}

      this.get_token_by_token_statement.get(token, onStorageFinished.bind(this,onStorageTokenFinishedCallback));
}

// returns an object with success (false or true). and when success is true, an additional element in the obkect (data) is present with the selected row of the DB.
TokenStorage.prototype.getTokenByCookie = function (cookie_id,onStorageTokenFinishedCallback){



        function onStorageFinished(onStorageTokenFinishedCallback, error, row){

		if(error){
			onStorageTokenFinishedCallback({"success":false,"error":JSON.stringify(error)});
		}
	        else if(!row){
			onStorageTokenFinishedCallback({"success":false,"error":"no data found"});
		}
		else{
			onStorageTokenFinishedCallback({"success":true, "data":row});
		}

	}

        this.get_token_by_cookie_id_statement.get(cookie_id, onStorageFinished.bind(this,onStorageTokenFinishedCallback));
}

module.exports = TokenStorage;

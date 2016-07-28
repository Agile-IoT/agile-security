const OfflineValidation = require('../../../agile-idm-commons/token-validation.js');
const IDMHttpClient = require('../..//api-clients/http-idm-client.js');
const TokenStorage = require('../../../agile-idm-web-ui/auth/token-storage.js');


var Auth = function (conf) {
  this.source_web_server = "web-server";
  this.source_db = "token-storage";
  this.source_sqlite3_db_object = "sqlite3-db-object";

  this.source = conf["source"];
  if(this.source == this.source_sqlite3_db_object){
      this.source = this.source_db;//whether the db is read or passed as an object is the same
      this.tokenStorage =  conf['objects']['token-storage-obj'];
1  }
  else if(this.source==this.source_web_server){
     this.idmHttpClient = new IDMHttpClient(conf);
      //this.idm_url=conf[this.source_web_server];

  }
  else if(this.source == this.source_db){
     this.tokenStorage = new TokenStorage(conf[this.source_db]);
     this.tokenStorage.init(conf[this.source_db]);
  }
  this.offlineValid = new OfflineValidation();


};

/*
  * the credentials field is mandatory (token). auth_type and principal are ignored currently.
  * for now this function is just used to authenticate users from tokens
  * depending on the configuration of this module, validation could be done against:
  *     1. sqlite3 database 2. an agile-idm web server or (in the future...) 3. external IdPs (in this case the auth_type is mandatory)
   the response provided in the callback should contain (in data):
	* username
	* id
	* auth_type
*/
// THIS IS THE METHOD THAT SHOULD BE CALLED FROM THE OUTSIDE!!!
Auth.prototype.authenticateEntity = function (auth_type, principal, credentials,onAuthenticationFinished) {
  //console.log(JSON.stringify(arguments));
  if(this.source == this.source_db){
      if(auth_type == "agile-cookie"){
          this.authenticateUserByCookieDB(credentials,onAuthenticationFinished);
      }else if (auth_type == "github"|| auth_type == "google"|| auth_type == "dropbox" || auth_type == "web_id" || auth_type =="unix_pam"){
          this.authenticateUserByTokenDB(credentials,onAuthenticationFinished);
      }
      else{
        onAuthenticationFinished({success:false, error:'wrong kind of authentication ( not implemented ) in mode: '+this.source});
      }

  }
  else if(this.source == this.source_web_server){
        this.authenticateUserByTokenWebServer(auth_type,credentials,onAuthenticationFinished);
        //return onAuthenticationFinished({"success":true,"data":{"name":"123gv","owner":"{\"id\":\"7145094133384309\",\"cookie\":\"7145094133384309\",\"token\":\"5370854131348528\",\"scope\":\"web_id\",\"token_type\":\"web_id\",\"auth_type\":\"web_id\",\"userId\":\"maybe cert fingerprint... or something like this\",\"expiration\":\"2029-07-12 16:46:37\"}"}});
  }
  else{
    onAuthenticationFinished({success:false, error:'wrong kind of authentication ( not implemented ) in mode: '+this.source});
  }
}

Auth.prototype.authenticateUserByTokenWebServer = function (auth_type, credentials,onAuthenticationFinished) {

    	function onTokenFinished(onAuthenticationFinished, result){
    		if(!result){
    			var result = {"success":false,"error":"did not find previous identifier for authentication info "};
    			onAuthenticationFinished(result);
    		}
    		else{
             //console.log("result from IDM web server component:" +JSON.stringify(result));
             if(result.success){
    			        this.offlineValid.offlineTokenValidation(result.data, this.onValidationFinished.bind(this,onAuthenticationFinished));
            }else{
                onAuthenticationFinished(result);
            }
    		}
    	}
    	this.idmHttpClient.authenticateEntity(auth_type,credentials,onTokenFinished.bind(this, onAuthenticationFinished));
}


Auth.prototype.authenticateUserByTokenDB = function (credentials,onAuthenticationFinished) {

    	function onTokenFinished(onAuthenticationFinished, result){
    		if(!result){
    			var result = {"success":false,"error":"did not find previous identifier for authentication info "};
    			onAuthenticationFinished(result);
    		}
    		else{
             if(result.success){
    			        this.offlineValid.offlineTokenValidation(result.data, this.onValidationFinished.bind(this,onAuthenticationFinished));
            }else{
                onAuthenticationFinished(result);
            }
    		}
    	}
    	this.tokenStorage.getTokenByToken(credentials,onTokenFinished.bind(this, onAuthenticationFinished));
}

/*
* This function is used to authenticate users by cookies...
*/
Auth.prototype.authenticateUserByCookieDB = function (cookie,onAuthenticationFinished) {
    if(this.source != this.source_db){
         onAuthenticationFinished({success:false, error:'authenticate by cookie is not implemented without a local database from the authentication module'});
    }
   function onCookieReadOrError(result){
      if(result.success){
          this.offlineValid.offlineTokenValidation(result.data, this.onValidationFinished.bind(this,onAuthenticationFinished));
      }
     else{
          onAuthenticationFinished(result);
     }
   }
   this.tokenStorage.getTokenByCookie(cookie, onCookieReadOrError.bind(this));
}


//to manage callbacks conviniently but should not be called from the outside...
Auth.prototype.onValidationFinished = function(onAuthenticationFinished, result){
  if(!result){
    var result = {"success":false,"error":"cannot get authentication result "};
    onAuthenticationFinished(result);
  }
  else{
    //console.log('auth finished'+JSON.stringify(result));
    onAuthenticationFinished(result);
  }
}

module.exports = Auth;

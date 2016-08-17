//TODO Thilo update here and put sqlite3 storage
const FileStorage	 = require('./storage/file-storage.js');
const Validator = require('./validator/validator.js');
const Authentication = require('../../agile-idm-commons/authentication.js');
const Authorization = require('./authorization/authorization.js');
var fs = require("fs");


var Api = function (authenticationObject,validatorObject, authorizationObject,storageObject) {

   if(arguments.length==0){
	JSON.stringify(arguments);
	var filePath = './conf/validator-entities.conf';
        var data = fs.readFileSync(filePath,{encoding:'utf-8'});
	var schema = JSON.parse(data);
	this.authentication = new Authentication();
   	this.validator = new Validator(schema);
  	this.authz = new Authorization();
   	this.storage = storageObject;

   }
   else{
        this.authentication = authenticationObject;
        this.validator = validatorObject;
        this.authz = authorizationObject;
        this.storage = storageObject;

   }

};

//username can be empty if an oauth2 token is provided... it is just there to ensure that if we ever need usernames, they are already propagated...
Api.prototype.executeAction = function (auth_type,username, credentials,action,entity_type, entity_id, data, onActionFinished) {


   function onAuthenticationFinished(params,result){

	if(result.success){
		if(result.data.id  ){
			//params.principal = { id : result.data.id, username : result.data.username, auth_type :result.data.auth_type };
			params.principal = result.data;
			//console.log("api params"+JSON.stringify(params));
			//continues here
			this.authz.validateActionAuthorized(params.entity_type, params.data,
					params.action, params.entity_id, params.principal,
					onAuthorizationFinished.bind(this,params));


		}
		else	return onActionFinished(result);
        }
	else return onActionFinished(result);
   }
   function onAuthorizationFinished(params,result){
	if(result.success){
			//TODO fix this... make it a reference field and store user when it is not there...
			data.owner = JSON.stringify(params.principal);
			this.storage.crudOperation(params.entity_id, params.entity_type, params.action, params.data,
				onStorageFinished.bind(this,params));
	}
	else return onActionFinished(result);


   }
   function onStorageFinished(params,result){
		// final callback here!
		onActionFinished(result);
   }

   var result = this.validator.validate(entity_type,data,action);

   if(result.success){
	var params = {"auth_type":auth_type,"username":username,"credentials":credentials,
		      "action":action,"entity_type":entity_type,"entity_id":entity_id,
		      "data":data, "onActionFinished":onActionFinished
	};
      	this.authentication.authenticateEntity(auth_type,username,credentials,onAuthenticationFinished.
			bind(this,params));
   }else{
         onActionFinished(result);
   }

}


module.exports = Api;

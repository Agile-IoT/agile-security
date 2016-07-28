const  request  = require('request');

var DropboxAuth = function () {


};


/*
   the response provided in the callback should contain (in data):
	* username 
	* id	
	* auth_type
	* Additional (email) if it has been verified
*/
DropboxAuth.prototype.authenticateEntity = function (auth_type, principal, credentials,onAuthenticationFinished) {

	
	var options = {
                        url: "https://api.dropboxapi.com/1/account/info",
                        headers: {'Authorization': "Bearer "+credentials, 
				   "User-Agent": "user-agent",
				  'content-type': 'application/json'}                               
        };
	function handleHttpResponse(error, response, body) {
                                  if (!error && response.statusCode == 200) {
					var result = {"success":true,"error":"","data":{}};
					//console.log(body);					
					res = JSON.parse(body);
					result.data["username"] = res["display_name"];
					result.data["id"] = res["uid"];
					result.data["auth_type"]=auth_type;
					if("email" in res && "email_verified" in res && res["email_verified"]){
						result.data["email"] = res["email"];
				        }
					//console.log("auth successful. Status Code: "+response.statusCode);
					onAuthenticationFinished(result);
					return;
                                  }
				  else if (!error) {
				  	var result = {"success":false,
						"error": "wrong satus code from authentication: "+response.statusCode+" error "+ body};
					if(response.statusCode == 401){
						result.error = "bad credentials for dropbox authentication";
					}
					onAuthenticationFinished(result);
					return;
				  }
                                  else{
					var result = {"success":false,"error":JSON.stringify(error)};
					onAuthenticationFinished(result);
					return;
                                  }
			}
	request.get(options,handleHttpResponse);

		// TODO here we will have to plug different kinds of authentication components.

}

//this function should be overwritten by the owner of this object using the API.
//result.success is a boolean containing whether the action was successful. In case result.success is false, the error is stored in result.error.


module.exports = DropboxAuth;

const  request  = require('request');

var GithubAuth = function () {


};
/*
   the response provided in the callback should contain (in data):
	* username
	* id
	* auth_type
*/
GithubAuth.prototype.authenticateEntity = function (auth_type, principal, credentials,onAuthenticationFinished) {


	var options = {
                        url: "https://api.github.com/user",
                        headers: {'Authorization': "token "+credentials,
				   "User-Agent": "user-agent",
				  'content-type': 'application/json'}
        };
	function handleHttpResponse(error, response, body) {
                                  if (!error && response.statusCode == 200) {
					var result = {"success":true,"error":"","data":{}};
					res = JSON.parse(body);
					result.data["username"] = res.login;
					result.data["id"] = res.login;//id not used...
					result.data["auth_type"]=auth_type;
					//console.log("auth successful. Status Code: "+response.statusCode);
					onAuthenticationFinished(result);
					return;
                                  }
				  else if (!error) {
				  	var result = {"success":false,
						"error": "wrong satus code from authentication: "+response.statusCode+" error "+ body};
					if(response.statusCode == 401){
						result.error = "bad credentials for github authentication";
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
}

//this function should be overwritten by the owner of this object using the API.
//result.success is a boolean containing whether the action was successful. In case result.success is false, the error is stored in result.error.


module.exports = GithubAuth;

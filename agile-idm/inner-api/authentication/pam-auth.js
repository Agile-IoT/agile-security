var pam = require('authenticate-pam');

var PamAuth = function () {


};


/*
   the response provided in the callback should contain (in data):
	* username 
	* id	
	* auth_type
*/
PamAuth.prototype.authenticateEntity = function (auth_type, principal, credentials,onAuthenticationFinished) {


	
}

module.exports = PamAuth;

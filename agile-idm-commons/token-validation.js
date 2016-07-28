/*
	this class validates the token information offline... 
*/
var TokenValidation = function () {
   
};

TokenValidation.prototype.offlineTokenValidation = function (tokenObject, onValidationFinished) {
	        //TODO check token expiration
		//var result = {"success":true, "data":token};
		onValidationFinished({success:true, data:tokenObject});

//		var result = {"success":false,"error":"undefined authentication method: "+auth_type};
		
	
}

//this function should be overwritten by the owner of this object using the API.
//result.success is a boolean containing whether the action was successful. In case result.success is false, the error is stored in result.error.


module.exports = TokenValidation;

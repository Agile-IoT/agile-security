
var Authorization = function (authzConfiguration) {
   this.conf  = authzConfiguration;
};

Authorization.prototype.validateActionAuthorized = function (entity_type, data, action, entity_id, principal,onvalidateActionAuthorizedFinished) {

	var result = {"success":true,"error":""};
	onvalidateActionAuthorizedFinished(result);
}

//this function should be overwritten by the owner of this object using the API.
//result.success is a boolean containing whether the action was successful. In case result.success is false, the error is stored in result.error.


module.exports = Authorization;

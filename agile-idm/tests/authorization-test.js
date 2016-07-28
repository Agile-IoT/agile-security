var assert = require('assert');
const Authorization	 = require('../inner-api/authorization/authorization.js');


describe('authorization', function() {
  describe('#validateActionAuthorized()', function () {
    it('should return success when action is allowed', function (done) {

      var authzConf = {};
      var authz = new Authorization(authzConf);
      function onvalidateActionAuthorizedFinished  (result){
	if(result.success){
		done();
        }
	else throw result.error;
      }
      authz.validateActionAuthorized("user",{"username":"juan"},"create","id123","principal_executingAction",onvalidateActionAuthorizedFinished);	
    });



  });
});

var assert = require('assert');
const Auth = require('../agile-idm-commons/authentication.js');


describe('authentication', function() {
  describe('#authenticateEntity()', function () {
    it('should return error when the authentication type doesnot exist', function (done) {

      var authConf = {};
      var auth = new Auth(authConf);
      var onAuthenticationFinished = function (result){
	if(result.success==false){
		done();
        }
	else throw result.error;
      }
      auth.authenticateEntity("wrong-auth-type","juan.com","password",onAuthenticationFinished);
    });



  });
});

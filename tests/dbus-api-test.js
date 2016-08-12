var dbus = require('dbus-native');
const IDMDbusApi= require('../agile-idm/external-api/d-bus/idm-session-dbus.js');
var fs = require('fs');
const Api = require('../agile-idm/inner-api/api.js');
const FileStorage	 = require('../agile-idm/inner-api/storage/file-storage.js');
const Validator = require('../agile-idm/inner-api/validator/validator.js');
const Authentication = require('../agile-idm/inner-api/authentication/authentication.js');


const IDMClient = require('../agile-idm/api-clients/dbus-session-client.js');






var assert = require('assert');
const Authorization	 = require('../agile-idm/inner-api/authorization/authorization.js');


describe('client-idm', function() {
  describe('#registerEntity()', function () {
    it('should return success after registering the entity TODO fix still async', function (done) {

	var fp = './agile-idm/conf/validator-entities.conf';
	var d = fs.readFileSync(fp,{encoding:'utf-8'})
        var sch = JSON.parse(d);
	//dummy auth
	var dummyAuth = {
	  		authenticateEntity : function (auth_type, principal, credentials,onAuthenticationFinished) {
			  var result = {"success":true,"error":"","data":{}};
			  result.data["username"] = "test_user";
			  result.data["id"] = "test_id";
			  result.data["auth_type"]="test_auth_type";
			  onAuthenticationFinished(result);
			}
	}
	var conf = {
	  filePath : fp,
	  data : d,
	  schema : sch,
	  authentication : dummyAuth,//new Authentication(),
	  validator : new Validator(sch),
	  authz : new Authorization(),
	  storage : new FileStorage()
	};

	var api = new IDMDbusApi(conf);
	api.run();

	//finished with the server setup... now the client
        function afterIDMAction(done, result){
		if(result.success && result.res == 2){//current return value for received request... TODO still cannot check the actual result.. need to add async calls
			done();
		}
		else{
			 throw result.error;
		}//console.log('response'+JSON.stringify(result));
	}
	var client = new IDMClient();
	client.registerEntity({"id":"1","auth_type":"github","token":"token_here","entity_type":"sensor","name":"123"},afterIDMAction.bind(this,done));
      })
  });
});

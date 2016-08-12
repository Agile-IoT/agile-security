var assert = require('assert');
const Api = require('../agile-idm/inner-api/api.js');
const Validator = require('../agile-idm/inner-api/validator/validator');
const Authorization	 = require('../agile-idm/inner-api/authorization/authorization.js');
const FileStorage	 = require('../agile-idm/inner-api/storage/file-storage.js');

const fs = require('fs');

var fp = './agile-idm/conf/validator-entities.conf';
var d = fs.readFileSync(fp,{encoding:'utf-8'})
var sch = JSON.parse(d);
var dummyAuth = {
      authenticateEntity : function (auth_type, principal, credentials,onAuthenticationFinished) {
        var result = {"success":false,"error":"wrong username and password","data":{}};

        if(credentials == "token" && auth_type=="auth_type_test"){
          result.success = true;
          result.error = undefined;
          result.data["username"] = "test_user";
          result.data["id"] = "test_id";
          result.data["auth_type"]="test_auth_type";
        }
      onAuthenticationFinished(result);
    }
}

describe('api', function() {
  describe('#executeAction()', function () {
    it('should create store an entity when the validator accepts it and store it in the storage object', function (done) {


    	//dummy auth

      var api  = new Api(dummyAuth, new Validator(sch), new Authorization(),new FileStorage())
      api.executeAction("auth_type_test",null,"token","create","sensor","id1",{"name":"123"},onActionFinished.bind(this));


      function onActionFinished(result){
        	if(result.success){
        		done();
          }
        	else throw result.error;
     }





    });


    it('should create store an entity when the validator accepts it and store it in the storage object', function (done) {

      /*var schema = [{
	"entity_type": "user",
	"attributes": [{
			 "name": "username",
			 "mandatory":true
			}, {
			 "name": "domain",
			 "mandatory":false
 		        },{
			 "name":"auth_type",
			 "mandatory":true,
			 "values":["oauth2"]
			}
	 ]
      }];
      var validator = new Validator(schema);
      var storage = {};*/


      function onActionFinished(result){
	if(result.success){
		done();
        }
	else throw result.error;
      }


      var api  = new Api(dummyAuth, new Validator(sch), new Authorization(),new FileStorage())
      api.executeAction("auth_type_test",null,"token","create","sensor","id2",{"name":"143"},onActionFinished.bind(this));



    });



  });
});

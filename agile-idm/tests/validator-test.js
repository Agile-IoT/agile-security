var assert = require('assert');
const Validator = require('../inner-api/validator/validator.js');
describe('validator', function() {
  describe('#validate()', function () {
    it('should return values_missing when creating entity missing a required property from the schema', function () {

      var schema = [{
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
      var result =validator.validate("user",{"domain":"juan.com"},"create");
      assert.equal(result.success,false);
      assert.equal(result.error,"values_missing");


      result =validator.validate("user",{"unexistent_prop":"juan.com"},"create");
      assert.equal(result.success,false);
      assert.equal(result.error,"values_missing");
    });


    it('should return invalid_property in case an attribute not part of the schema is sent', function () {

         var schema = [{
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
      var result = validator.validate("user",{"username":"juan","domain":"juan.com","auth_type":"oauth2","non-existent_prop":3},"create");
      assert.equal( result.success,false);
      assert.equal( result.error,"invalid_property");
    });

    it('should return wrong_values when creating entity with wrong_values in respect to those specified for attribues containing the values key in the the schema', function () {

      var schema = [{
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
      var result = validator.validate("user",{"username":"juan","domain":"juan.com","auth_type":"some_non_existing_auth"},"create");
      assert.equal(result.error,"wrong_values");
      assert.equal(result.success,false);
    });


    it('should return undefined_entity and result.success == false when creating entity with  an entity_type not present in the schema', function () {

      var schema = [{
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
      var result = validator.validate("airplane",{"username":"juan","domain":"juan.com","auth_type":"some_non_existing_auth"},"create");
      assert.equal(result.error,"undefined_entity");
      assert.equal(result.success,false);
    });

    it('should return success when creating entity with   an entity_type present in the schema with proper values and including all required fields', function () {

      var schema = [{
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
      var result = validator.validate("user",{"username":"juan","domain":"juan.com","auth_type":"oauth2"},"create");
      assert.equal( result.success,true);
    });



    //TODO pass a property that is not in the list!!! verify this is not possible!!!


























  });
});

const assert = require('assert');
const deepdif = require('deep-diff');
const clone = require('clone');
const Sqlite3Storage	 = require('../agile-idm/inner-api/storage/sqlite3-storage.js');
const fs = require("fs");
const dbName = "database.db";


describe('Sqlite3Storage', function() {
  describe('#crudOperation()', function () {
    //called after each test to delete the database
    afterEach(function() {
        if(fs.existsSync(dbName))
          fs.unlinkSync(dbName);
    });

    it('should return without data and success == false when entity is not there', function (done) {
      var storeConf = {"dbName":dbName};
      var storage = new Sqlite3Storage(storeConf);
      function onCrudOperationFinished (result){
	      if(result.success == false){
		      done();
        }
        else throw result.error;
      }
      storage.init(function(result){
      	if(result.success == true){
      		storage.crudOperation("unexistent-stuff", "user", storage.READ, undefined, onCrudOperationFinished);
    		}
    		else{
    			throw result.error;
  			}
      });
    });


    it('should return the  data by an id, if it has been previously stored', function (done) {
      var storeConf = {"dbName":dbName};
      var storage = new Sqlite3Storage(storeConf);
      function onCreateFinished (data,result){
	      if(result.success == true){
		      delete result.data.id;//id is included so remove it to check
		      delete result.data.type;//entity type is included so remove it to check
		      if(deepdif.diff(data,result.data) == undefined){
			      storage.crudOperation("1", "user", storage.READ, "", onReadFinished.bind(this,data));

		      }
		      else throw "data returned from CREATE doesn't match what I intended to store!";
        }
	      else throw result;
      }
      function onReadFinished(data, result){
        if(result.success == true){
          delete result.data.id;//id is included so remove it to check
          delete result.data.type;//entity type is included so remove it to check
		      if(deepdif.diff(data,result.data) == undefined){
			      //after reading the same element as it was created... then we are fine
			      done();
		      }
		      else throw "data returned from READ, after CREATE doesn't match what I intended to store!";
        }
	      else throw result;
      }
      data = {"data":123,"item":123};
      storage.init(function(result){
      	if(result.success == true){
      		storage.crudOperation("1", "user", storage.CREATE, data, onCreateFinished.bind(this,data));
    		}
    		else throw result.error;
      });
    });


    it('should update the  data by an id', function (done) {
      var storeConf = {"dbName":dbName};
      var storage = new Sqlite3Storage(storeConf);

      function onCreateFinished (data,result){
        if(result.success == true){
	        delete result.data.id;//id is included so remove it to check
	        delete result.data.type;//entity type is included so remove it to check
	        if(deepdif.diff(data,result.data) == undefined){
		        data["new_thing"]="a";
		        storage.crudOperation("1", "user", storage.UPDATE, data, onUpdateFinished.bind(this,data));
	        }
	        else throw "data returned from CREATE doesn't match what I intended to store!";
        }
        else throw result;
      }
      function onUpdateFinished(data, result){
        if(result.success == true){
          delete result.data.id;//id is included so remove it to check
          delete result.data.type;//entity type is included so remove it to check
          if(deepdif.diff(data,result.data) == undefined){
	          storage.crudOperation("1", "user", storage.READ, "", onSecondRead.bind(this,data));
		      }
          else throw "data returned from READ, after CREATE doesn't match what I intended to store!";
        }
        else throw result;
      }
      function onSecondRead(data, result){
        delete result.data.id;//id is included so remove it to check
        delete result.data.type;//entity type is included so remove it to check
        if(deepdif.diff(data,result.data) == undefined){
	        done();
        }
        else throw "data was not updated succesfully. Data doesn't match what I intended to update";
      }
      data = {"data":123,"item":123};
      storage.init(function(result){
      	if(result.success == true){
      		storage.crudOperation("1", "user", storage.CREATE, data, onCreateFinished.bind(this,data));
    		}
    		else throw result.error
      });
    });


    it('should delete the  data by an id', function (done) {
      var storeConf = {"dbName":dbName};
      var storage = new Sqlite3Storage(storeConf);
      function onCreateFinished (data,result){
        if(result.success == true){
	        delete result.data.id;//id is included so remove it to check
	        delete result.data.type;//entity type is included so remove it to check
	        if(deepdif.diff(data,result.data) == undefined){
		        storage.crudOperation("1", "user", storage.READ, "", onReadFinished.bind(this,data));
	        }
	        else throw "data returned from CREATE doesn't match what I intended to store!";
        }
        else throw result;
      }
      function onReadFinished(data, result){
        if(result.success == true){
          delete result.data.id;//id is included so remove it to check
          delete result.data.type;//entity type is included so remove it to check
          if(deepdif.diff(data,result.data) == undefined){
	          storage.crudOperation("1", "user", storage.DELETE, "", onDelete.bind(this,data));
          }
          else throw "data returned from READ, after CREATE doesn't match what I intended to store!";
        }
        else throw result;
      }
      function onDelete(data, result){
        if(result.success == true){
          storage.crudOperation("1", "user", storage.READ, "", onSecondRead.bind(this,data));
        }
        else throw result;
      }
      function onSecondRead(data, result){
        if(result.success == false){
	        done();
        }
        else throw "data was not removed succesfully. it is still there!";
      }
      data = {"data":123,"item":123};
      storage.init(function(result){
      	if(result.success == true){
      		storage.crudOperation("1", "user", storage.CREATE, data, onCreateFinished.bind(this,data));
    		}
    		else throw result.error;
      });
    });

    it('should return copies, and make copies of data (instead of references)', function (done) {
      var storeConf = {"dbName":dbName};
      var storage = new Sqlite3Storage(storeConf);

      function onCreateFinished (data,result){
        if(result.success == true){
	        delete result.data.id;//id is included so remove it to check
	        delete result.data.type;//entity type is included so remove it to check
	        originalData = clone(data);
	        if(deepdif.diff(data,result.data) == undefined){
		        data["new_thing"]="a";
		        result.data["new_thing"]="b";
		        storage.crudOperation("1", "user", storage.READ, "", onSecondRead.bind(this,originalData, data,result.data));
	        }
	        else throw "data returned from CREATE doesn't match what I intended to store!";
        }
        else throw result;
      }
      function onSecondRead(originalData,data1,data2,result){
        if(result.success == true){
	        delete result.data.id;//id is included so remove it to check
	        delete result.data.type;//entity type is included so remove it to check
	        if(deepdif.diff(originalData,result.data) == undefined){
		        done();
	        }
        }
        else throw "data  not present after storing it!";
      }
      data = {"data":123,"item":123};
      storage.init(function(result){
      	if(result.success == true){
      		storage.crudOperation("1", "user", storage.CREATE, data, onCreateFinished.bind(this,data));
    		}
    		else throw result.error;
      });
    });
 });
});

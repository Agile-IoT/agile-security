const assert = require('assert');
const deepdif = require('deep-diff');
const clone = require('clone');
const FileStorage	 = require('../agile-idm/inner-api/storage/file-storage.js');


describe('fileStorage', function() {
  describe('#crudOperation()', function () {
    it('should return without data and success == false when entity is not there', function (done) {
      var storeConf = {};
      var storage = new FileStorage(storeConf);
      function onCrudOperationFinished (result){
	if(result.success == false){
		done();
        }
	else throw result.error;
      }
      storage.crudOperation("unexistent-stuff", "type", storage.READ, undefined, onCrudOperationFinished);
    });




    it('should return the  data by an id, if it has been previously stored', function (done) {
      var storeConf = {};
      var storage = new FileStorage(storeConf);
      function onCreateFinished (data,result){
	if(result.success == true){
		delete result.data.id;//id is included so remove it to check
		if(deepdif.diff(data,result.data) == undefined){
			storage.crudOperation("1","type", storage.READ,"" , onReadFinished.bind(this,data));

		}
		else throw "data returned from CREATE doesn't match what I intended to store!";
        }
	else throw result;
      }
      function onReadFinished(data, result){
	 if(result.success == true){
		delete result.data.id;//id is included so remove it to check
		if(deepdif.diff(data,result.data) == undefined){
			//after reading the same element as it was created... then we are fine
			done();
		}
		else throw "data returned from READ, after CREATE doesn't match what I intended to store!";
        }
	else throw result;

      }
      data = {"data":123,"item":123};
      storage.crudOperation("1","type", storage.CREATE,data , onCreateFinished.bind(this,data));
    });





    it('should update the  data by an id', function (done) {
      var storeConf = {};
      var storage = new FileStorage(storeConf);

      function onCreateFinished (data,result){
	if(result.success == true){
		delete result.data.id;//id is included so remove it to check
		if(deepdif.diff(data,result.data) == undefined){
			data["new_thing"]="a";
			storage.crudOperation("1","type", storage.UPDATE, data, onUpdateFinished.bind(this,data));
		}
		else throw "data returned from CREATE doesn't match what I intended to store!";
        }
	else throw result;
      }

      function onUpdateFinished(data, result){
	 if(result.success == true){
		delete result.data.id;//id is included so remove it to check
		if(deepdif.diff(data,result.data) == undefined){
			storage.crudOperation("1","type", storage.READ,"", onSecondRead.bind(this,data));

		}
		else throw "data returned from READ, after CREATE doesn't match what I intended to store!";
       	 }
	 else throw result;

      }

      function onSecondRead(data, result){
		if(result.success){
			delete result.data.id;
			if(deepdif.diff(data,result.data) == undefined){
			        done();
       			 }
			else{

				throw "data was not updated succesfully"
			}
		}
		else{
			 console.log(JSON.stringify(result));
			 throw "cannot read after the update";
		}
      }
      data = {"data":123,"item":123};
      storage.crudOperation("1","type", storage.CREATE,data , onCreateFinished.bind(this,data));
    });



    it('should delete the  data by an id', function (done) {
      var storeConf = {};
      var storage = new FileStorage(storeConf);
      function onCreateFinished (data,result){
	if(result.success == true){
		delete result.data.id;//id is included so remove it to check
		if(deepdif.diff(data,result.data) == undefined){
			storage.crudOperation("1","type", storage.READ,"" , onReadFinished.bind(this,data));

		}
		else throw "data returned from CREATE doesn't match what I intended to store!";
        }
	else throw result;
      }
      function onReadFinished(data, result){
	 if(result.success == true){
		delete result.data.id;//id is included so remove it to check
		if(deepdif.diff(data,result.data) == undefined){
			storage.crudOperation("1", "type", storage.DELETE,"" , onDelete.bind(this,data));

		}
		else throw "data returned from READ, after CREATE doesn't match what I intended to store!";
       	 }
	 else throw result;

      }

      function onDelete(data, result){

	 if(result.success == true){
		storage.crudOperation("1","type", storage.READ,"", onSecondRead.bind(this,data));
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
      storage.crudOperation("1", "type", storage.CREATE,data , onCreateFinished.bind(this,data));
    });





    //TODO do this also for update...

    it('should return copies, and make copies of data (instead of references)', function (done) {
      var storeConf = {};
      var storage = new FileStorage(storeConf);

      function onCreateFinished (data,result){
	if(result.success == true){
		delete result.data.id;//id is included so remove it to check
		originalData = clone(data);
		if(deepdif.diff(data,result.data) == undefined){
			data["new_thing"]="a";
			result.data["new_thing"]="b";
			storage.crudOperation("1","type", storage.READ, "", onSecondRead.bind(this,originalData, data,result.data));
		}
		else throw "data returned from CREATE doesn't match what I intended to store!";
        }
	else throw result;
      }


      function onSecondRead(originalData,data1,data2,result){
		if(result.success == true){
			delete result.data.id;//id is included so remove it to check
			if(deepdif.diff(originalData,result.data) == undefined){
				done();
			}//if this fails. we could check with data1 and data2 to see what is happening
		}
		else throw "data  not present after storing it!";
      }
      data = {"data":123,"item":123};
      storage.crudOperation("1", "type", storage.CREATE,data , onCreateFinished.bind(this,data));
    });


 });
});

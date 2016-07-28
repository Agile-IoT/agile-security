const clone = require('clone');
var sqlite3 = require('sqlite3').verbose();

var FileStorage = function (storageConf) {
	this.conf = storageConf;
	this.READ="read";
	this.CREATE="create";
	this.UPDATE="update";
	this.DELETE="delete";
};



//statements
FileStorage.prototype.prepareStatements = function(onCreationFinished){
	var p1 = new Promise((resolve, reject) => {
		this.store_entity_statement = this.storage.prepare("INSERT INTO Entity  (id , type) VALUES(?, ?)", function(error){
			if(error){
				reject(error);
			}
			else
				resolve();
		});
	});
	var p2 = new Promise((resolve, reject) => {
		this.get_entity_by_id_statement = this.storage.prepare("SELECT * from Entity WHERE id =?", function(error){
			if(error){
				reject(error);
			}
			else
				resolve();
		});
	});
	var p3 = new Promise((resolve, reject) => {
		this.get_entity_attributes_by_id_statement = this.storage.prepare("SELECT type, value from StringAttributeValue WHERE fk_entity_id =$id UNION SELECT type, value from IntAttributeValue WHERE fk_entity_id =$id", function(error){
			if(error){
				reject(error);
			}
			else
				resolve();
		});
	});
	var p4 = new Promise((resolve, reject) => {
		this.store_string_attribute_value_statement = this.storage.prepare("INSERT INTO StringAttributeValue  (id, fk_entity_id, type, value) VALUES(?, ?, ?, ?)", function(error){
			if(error){
				reject(error);
			}
			else
				resolve();
		});
	});
	var p5 = new Promise((resolve, reject) => {
		this.store_int_attribute_value_statement = this.storage.prepare("INSERT INTO IntAttributeValue  (id, fk_entity_id, type, value) VALUES(?, ?, ?, ?)", function(error){
			if(error){
				reject(error);
			}
			else
				resolve();
		});
	});
	var p6 = new Promise((resolve, reject) => {
		this.delete_all_attributes_by_entity_id_statement = this.storage.prepare("DELETE from IntAttributeValue WHERE fk_entity_id =?", function(error){
			if(error){
				reject(error);
			}
			else
				resolve();
		});
	});
	var p7 = new Promise((resolve, reject) => {
		this.delete_entity_by_id_statement = this.storage.prepare("DELETE FROM Entity WHERE id = ?", function(error){
			if(error){
				reject(error);
			}
			else
				resolve();
		});
	});

	Promise.all([p1, p2, p3, p4, p5, p6, p7]).then(function(results){onCreationFinished({"success":true});}, function(reason){onCreationFinished({"success":false,"error":reason});});
}

//initialize
FileStorage.prototype.init = function (onCreationFinished){
	var filename = this.conf.dbName;
	var createTables = true;
	if(!filename || filename == null || filename ==""){
		this.storage =  new sqlite3.Database(':memory:');
	}
	else{
		this.storage = new sqlite3.Database(filename);
	}
	if(createTables){
		//create Entity table
		this.storage.run("CREATE TABLE IF NOT EXISTS Entity (id TEXT PRIMARY KEY, type TEXT NOT NULL)", onCreateEntityTableFinished.bind(this, onCreationFinished));

		function onCreateEntityTableFinished(onCreationFinished, error){
      if(error){
				onCreationFinished({"success":false,"error":error});
      }
			else{
			  //create StringAttributeValue table
				this.storage.run("CREATE TABLE IF NOT EXISTS StringAttributeValue (id TEXT PRIMARY KEY, fk_entity_id TEXT NOT NULL, type TEXT NOT NULL, value TEXT NOT NULL)", onCreateStringTableFinished.bind(this, onCreationFinished));
			}
    }

		function onCreateStringTableFinished(onCreationFinished, error){
			if(error){
				onCreationFinished({"success":false,"error":error});
	    }
			else{
			  //create IntAttributeValue table
				this.storage.run("CREATE TABLE IF NOT EXISTS IntAttributeValue (id TEXT PRIMARY KEY, fk_entity_id TEXT NOT NULL, type TEXT NOT NULL, value INT NOT NULL)", onCreateIntTableFinished.bind(this, onCreationFinished));
			}
    }

		function onCreateIntTableFinished(onCreationFinished, error){
	    if(error){
		    onCreationFinished({"success":false,"error":error});
      }
	    else{
		    this.prepareStatements(onCreationFinished);
      }
    }
	}
	else{
		this.prepareStatements(onCreationFinished);
	}
}

//converts the given sql-result rows to an object
function sqlRowsToObject(entity, attributes){
  var result = {};
  result["id"] = entity.id;
  result["type"] = entity.type;
  attributes.forEach(function(item){
    result[item.type] = item.value;
  });
  return result;
}

//returns the attributes of the entity with the given id
FileStorage.prototype.readEntity = function(id, onCrudOperationFinished){
  this.get_entity_by_id_statement.get(id, onGetEntityFinished.bind(this,onCrudOperationFinished));

  function onGetEntityFinished(onCrudOperationFinished, error, row){
    if(error){
      onCrudOperationFinished({"success":false,"error":error});
    }
    else if(!row){
      onCrudOperationFinished({"success":false,"error":"entity with id "+id+" not found"});
    }
    else{
      this.get_entity_attributes_by_id_statement.all(id, onGetAttributesFinished.bind(this, row, onCrudOperationFinished));
    }
  }

  function onGetAttributesFinished(entity, onCrudOperationFinished, error, rows){
    if(error){
      onCrudOperationFinished({"success":false,"error":error});
    }
    else if(!rows){
      onCrudOperationFinished({"success":false,"error":"entity with id "+id+" not found"});
    }
    else{
      var data = sqlRowsToObject(entity, rows)
      onCrudOperationFinished({"success":true, "data":data});
    }
  }
}

//inserts a entity with the given id and type in the entity table. The given attributes are stored in the attributeValue table regarding to their type (int or string)
FileStorage.prototype.createEntity = function(id, entity_type, data, onCrudOperationFinished){
  //print stuff
	var x = JSON.parse(JSON.stringify(data));
	x.owner = JSON.parse(data.owner);
	console.log('creating entity: '+JSON.stringify(x, null, 2));
	onCrudOperationFinished({success:true, data: x});
	//end of fix for demo
	//this.store_entity_statement.run(id, entity_type, onStoreEntityFinished.bind(this));

	function onStoreEntityFinished(error){
		if(error){
		  onCrudOperationFinished({"success":false,"error":JSON.stringify(error)});
		}
		else{
		  //wrap insertions
		  this.storage.run("BEGIN TRANSACTION");
		  for (var type in data) {
        if(typeof(data[type]) == "string")
          this.store_string_attribute_value_statement.run(id+"_"+type, id, type, data[type]);
        else if(typeof(data[type]) == "number")
          this.store_int_attribute_value_statement.run(id+"_"+type, id, type, data[type]);
        else
          onCrudOperationFinished({"success":false,"error":"Type not string or int: "+typeof(data[type])});
      }
      this.storage.run("END", onCreationFinished.bind(this, onCrudOperationFinished));
		}
	}

	function onCreationFinished(onCrudOperationFinished, error){
	  if(error){
		  onCrudOperationFinished({"success":false,"error":JSON.stringify(error)});
	  }
	  else{
	    onCrudOperationFinished({"success":true, "data":clone(data)});
	  }
  }
}

//updates the attributes of the entity with the given id
FileStorage.prototype.updateEntity = function(id, data, onCrudOperationFinished){

	this.delete_all_attributes_by_entity_id_statement.run(id, onAttributesDeleted.bind(this, onCrudOperationFinished));

	function onAttributesDeleted(onCrudOperationFinished, error){
	  if(error){
	    onCrudOperationFinished({"success":false,"error":JSON.stringify(error)});
	  }
	  else{
	    //wrap insertions
		  this.storage.run("BEGIN TRANSACTION");
		  for (var type in data) {
        if(typeof(data[type]) == "string")
          this.store_string_attribute_value_statement.run(id+"_"+type, id, type, data[type]);
        else if(typeof(data[type]) == "number")
          this.store_int_attribute_value_statement.run(id+"_"+type, id, type, data[type]);
        else
          onCrudOperationFinished({"success":false,"error":"Type not string or int: "+typeof(data[type])});
      }
      this.storage.run("END", onUpdateFinished.bind(this, onCrudOperationFinished));
	  }
	}

	function onUpdateFinished (onCrudOperationFinished, error){
	  if(error){
		  onCrudOperationFinished({"success":false,"error":JSON.stringify(error)});
	  }
	  else{
	    onCrudOperationFinished({"success":true, "data":clone(data)});
	  }
  }

}

//deletes the entity with the given id and all its attributes
FileStorage.prototype.deleteEntity = function(id, onCrudOperationFinished){
	this.delete_entity_by_id_statement.run(id, ondeleteEntityFinished.bind(this,onCrudOperationFinished));

  function ondeleteEntityFinished(onCrudOperationFinished, error){
		if(error){
			onStorageFinished({"success":false,"error":JSON.stringify(error)});
		}
		else{
		  this.delete_all_attributes_by_entity_id_statement.run(id, onAttributesDeleted.bind(this, onCrudOperationFinished));
		}
	}

	function onAttributesDeleted(onCrudOperationFinished, error){
    if(error){
      onCrudOperationFinished({"success":false,"error":JSON.stringify(error)});
    }
    else{
	    onCrudOperationFinished({"success":true});
	  }
	}
}

FileStorage.prototype.crudOperation = function (id, entity_type, action, data, onCrudOperationFinished) {
	if(action == this.READ){
		this.readEntity(id, onCrudOperationFinished);
	}
	else if(action == this.CREATE){
		this.createEntity(id,entity_type,data,onCrudOperationFinished);
	}
	else if(action == this.UPDATE){
		this.updateEntity(id,data,onCrudOperationFinished);
	}
	else if(action == this.DELETE){
		this.deleteEntity(id,onCrudOperationFinished);
	}
	else{
		var result = {"success":false,"error":"undefined type of action "+action+" for Storage"};
		onCrudOperationFinished(result);
	}

	//var result = {"success":true,"error":""};
	//this.onCrudOperationFinished(result);
}

//this function should be overwritten by the owner of this object using the API.
//result.success is a boolean containing whether the action was successful. In case result.success is false, the error is stored in result.error.
//result.data contains data in case result.success is true.
/*FileStorage.prototype.onCrudOperationFinished = function(result){
	console.log("FileStorage.prototype.onCrudOperationFinished should have been overwritten! - event not handled.");
	throw "FileStorage.prototype.onCrudOperationFinished should have been overwritten! - event not handled";
}*/

module.exports = FileStorage;

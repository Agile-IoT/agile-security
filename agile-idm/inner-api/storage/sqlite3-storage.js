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
		this.storage =  new sqlite3.Database(':memory:', onDatabaseReady.bind(this));
	}
	else{
		this.storage = new sqlite3.Database(filename, onDatabaseReady.bind(this));
	}
		
	function onDatabaseReady(error){
		if(error){
			onCreationFinished({"success":false,"error":error});
		}
		else{
			if(createTables){
				//FIXME 
				/*
					sometimes an 
						{"errno":14,"code":"SQLITE_CANTOPEN"}
						{ Error: SQLITE_CANTOPEN: unable to open database file
						at Error (native) errno: 14, code: 'SQLITE_CANTOPEN' }
						onCreationFinished({"success":false,"error":error});
					error is thrown here
				*/
				this.storage.run("CREATE TABLE IF NOT EXISTS Entity (id TEXT PRIMARY KEY, type TEXT NOT NULL)", onCreateEntityTableFinished.bind(this));							
			}
			else{
				this.prepareStatements(onCreationFinished);
			}
		}
	}
	
	function onCreateEntityTableFinished(error){
	  if(error){
			onCreationFinished({"success":false,"error":error});
	  }
		else{		
			//create StringAttributeValue table		
			this.storage.run("CREATE TABLE IF NOT EXISTS StringAttributeValue (id TEXT PRIMARY KEY, fk_entity_id TEXT NOT NULL, type TEXT NOT NULL, value TEXT NOT NULL)", onCreateStringTableFinished.bind(this));
		}
	}	

	function onCreateStringTableFinished(error){
		if(error){				
			onCreationFinished({"success":false,"error":error});
		}
		else{
			//create IntAttributeValue table
			this.storage.run("CREATE TABLE IF NOT EXISTS IntAttributeValue (id TEXT PRIMARY KEY, fk_entity_id TEXT NOT NULL, type TEXT NOT NULL, value INT NOT NULL)", onCreateIntTableFinished.bind(this));
		}
	}

	function onCreateIntTableFinished(error){
		if(error){
			onCreationFinished({"success":false,"error":error});
	  }
		else{
			this.prepareStatements(onCreationFinished);
	  }	
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
  this.get_entity_by_id_statement.get(id, onGetEntityFinished.bind(this)); 
  
  function onGetEntityFinished(error, row){
    if(error){
      onCrudOperationFinished({"success":false,"error":error});
    }
    else if(!row){
      onCrudOperationFinished({"success":false,"error":"entity with id "+id+" not found"});
    }
    else{
      this.get_entity_attributes_by_id_statement.all(id, onGetAttributesFinished.bind(this, row));
    }
  }
  
  function onGetAttributesFinished(entity, error, rows){
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
	this.store_entity_statement.run(id, entity_type, onStoreEntityFinished.bind(this));
	
	function onStoreEntityFinished(error){
		if(error){
		  onCrudOperationFinished({"success":false,"error":error});
		}
		else{
		  //wrap insertions
		  this.storage.run("BEGIN", onTransactionStart.bind(this));
		}
	}
	
	function onTransactionStart(error){
		if(error){
			onCrudOperationFinished({"success":false,"error":error});
		}
		else{
			for (var type in data) {        
				if(typeof(data[type]) == "string")
					this.store_string_attribute_value_statement.run(id+"_"+type, id, type, data[type]);
				else if(typeof(data[type]) == "number")
					this.store_int_attribute_value_statement.run(id+"_"+type, id, type, data[type]);
				else
					onCrudOperationFinished({"success":false,"error":"Type not string or int: "+typeof(data[type])});
			}			
			this.storage.run("COMMIT", onCreationFinished.bind(this));
		}
	}
				
	function onCreationFinished(error){
	  if(error){
		  onCrudOperationFinished({"success":false,"error":error});
	  }
	  else{
	    onCrudOperationFinished({"success":true, "data":clone(data)});
	  }
  }
}

//updates the attributes of the entity with the given id
FileStorage.prototype.updateEntity = function(id, data, onCrudOperationFinished){
	this.delete_all_attributes_by_entity_id_statement.run(id, onAttributesDeleted.bind(this));
	
	function onAttributesDeleted(error){
	  if(error){
	  	onCrudOperationFinished({"success":false,"error":error});
	  }
	  else{
	    //wrap insertions
		  this.storage.run("BEGIN", onTransactionStart.bind(this));
	  }
	}
	
	function onTransactionStart(error){
		if(error){
			onCrudOperationFinished({"success":false,"error":error});
		}
		else{
			for (var type in data) {        
				if(typeof(data[type]) == "string")
					this.store_string_attribute_value_statement.run(id+"_"+type, id, type, data[type]);
				else if(typeof(data[type]) == "number")
					this.store_int_attribute_value_statement.run(id+"_"+type, id, type, data[type]);
				else
					onCrudOperationFinished({"success":false,"error":"Type not string or int: "+typeof(data[type])});
			}		
			this.storage.run("COMMIT", onUpdateFinished.bind(this));
		}
	}
	
	function onUpdateFinished (error){
	  if(error){
		  onCrudOperationFinished({"success":false,"error":error});
	  }
	  else{
	    onCrudOperationFinished({"success":true, "data":clone(data)});
	  }
  }	
}

//deletes the entity with the given id and all its attributes
FileStorage.prototype.deleteEntity = function(id, onCrudOperationFinished){
	this.delete_entity_by_id_statement.run(id, ondeleteEntityFinished.bind(this));  
	      
  function ondeleteEntityFinished(error){
		if(error){
			onCrudOperationFinished({"success":false,"error":error});
		}
		else{
		  this.delete_all_attributes_by_entity_id_statement.run(id, onDeleteFinished.bind(this));
		}		
	}
	
	function onDeleteFinished(error){
		if(error){
			onCrudOperationFinished({"success":false,"error":error});
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
}

module.exports = FileStorage;

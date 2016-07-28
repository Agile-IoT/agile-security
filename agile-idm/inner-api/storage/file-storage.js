const clone = require('clone');

//if storageConf is empty, an in-memory storage is used (for unit testing)
var FileStorage = function (storageConf) {
   this.conf = storageConf;  
   this.entities = [];
   this.READ="read";
   this.CREATE="create";
   this.UPDATE="update";
   this.DELETE="delete";

   

};

//returns a COPY of the object with id == id or an error with success.false in the result object passed to the callback
FileStorage.prototype.readEntity = function(id, onCrudOperationFinished){

	for(var i=0; i<this.entities.length; i++){
		if(this.entities[i]["id"] == id){
			var result = {"success":true,"data":clone(this.entities[i])};
			onCrudOperationFinished(result);
			return;
		}		
	}
	var result = {"success":false,"error":"entity with id "+id+" not found"};
	onCrudOperationFinished(result);
	
}

//inserts a COPY of the data2 object with id == id or an error with success.false in the result object passed to the callback
FileStorage.prototype.createEntity = function(id, data2, onCrudOperationFinished){

	for(var i=0; i<this.entities.length; i++){
		if(this.entities[i]["id"] == id){
			var result = {"success":false,"error":"entity with id "+id+" already exists"};
			onCrudOperationFinished(result);
			return;
		}		
	}
	var data = clone(data2);
	data["id"] = id;
	this.entities.push(data);
	var result = {"success":true,"data":clone(data)};
	console	.log("data: "+JSON.stringify(this.entities));
	onCrudOperationFinished(result);
	
}

//updates the entity with  id == id with  a COPY of the data, or calls the callback with  an error with success.false
FileStorage.prototype.updateEntity = function(id, data, onCrudOperationFinished){

	for(var i=0; i<this.entities.length; i++){
		if(this.entities[i]["id"] == id){
			this.entities[i] = clone(data);
			this.entities[i]["id"] = id;
			var result = {"success":true,"data":clone(data)};
			onCrudOperationFinished(result);
			return;
		}		
	}
	var result = {"success":false,"error":"entity with id "+id+" not found "};
	onCrudOperationFinished(result);
	
}
//deletes the entity...
FileStorage.prototype.deleteEntity = function(id, onCrudOperationFinished){

	for(var i=0; i<this.entities.length; i++){
		if(this.entities[i]["id"] == id){
			this.entities.splice(i,1);
			var result = {"success":true};
			onCrudOperationFinished(result);
			return;
		}		
	}
	var result = {"success":false,"error":"entity with id "+id+" not found "};
	onCrudOperationFinished(result);
	
}

FileStorage.prototype.crudOperation = function  (id, entity_type, action, data, onCrudOperationFinished) {

	if(action == this.READ){
		this.readEntity(id, onCrudOperationFinished);		
	}	
	else if(action == this.CREATE){
		this.createEntity(id,data,onCrudOperationFinished);		
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

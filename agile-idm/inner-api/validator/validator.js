const fs = require('fs');

// ------------------------- validate module -------------------------------------------

var MyModule = function (schema) {
	this.schema = schema;
};

MyModule.prototype.findItemByName = function(pending_properties,name){
	for(var i = 0; i<pending_properties.length; i++){
		if(pending_properties["name"] == name){
			return i;
		}
        }
	return -1;
}

MyModule.prototype.validate_create = function (entity_type, data) {

   var result = {};

   for(var d=0; d<this.schema.length; d++){
        if(entity_type == this.schema[d]["entity_type"]){
           var pending_properties = Object.keys(data);
	   var def = this.schema[d].attributes;
	   var keys = Object.keys(def);
           for(var i=0; i<keys.length;i++){
               var prop_description = def[keys[i]];
               if(prop_description["name"] in data ){
		    pending_properties.splice(this.findItemByName(pending_properties,prop_description["name"]),1);
    		    if( "values" in prop_description){
			var v = 0;
                   	for( v=0; v<prop_description.values.length; v++){
				if(data[prop_description["name"]] == prop_description.values[v]){
					break;
				}
			}
			if(v == prop_description.values.length){	
				result.success = false;
				result.error = "wrong_values";
				return result;
			}
	            }
	       }
	       else if( "mandatory" in prop_description && prop_description["mandatory"]){	
			result.success = false;
			result.error = "values_missing";
			return result;
	       }			
           }
	   if(pending_properties.length == 0){
	  	   result.success = true;
		   return result;
	   }
	   else{
		   result.success=false;
		   result.error="invalid_property";
		   return result;
	   }
	}
    }
    result.success = false;
    result.error =  "undefined_entity";
    return result;

}
//strict means that every property which is required 
// action = {create,update,read,delete}
// returns a string from {ok, values_missing, wrong_values,undefined_entity}
MyModule.prototype.validate = function (entity_type, data, action) {


   if(action =="create" || action =="update"){
      return this.validate_create(entity_type,data);
   }
   else if(action =="delete" || action =="read"){
	return {"success":true};
   }
   else return {"success":false,"error":"undefined type of action on validate"};
}


module.exports = MyModule;



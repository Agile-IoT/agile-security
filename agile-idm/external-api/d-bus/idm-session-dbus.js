var dbus = require('dbus-native');
var fs = require('fs');
const Api = require('../../inner-api/api.js');
const FileStorage	 = require('../../inner-api/storage/file-storage.js');
const Validator = require('../../inner-api/validator/validator.js');
const Authentication = require('../../../agile-idm-commons/authentication.js');
const Authorization = require('../../inner-api/authorization/authorization.js');


 //test from command line:
//dbus-send --print-reply --type=method_call --dest='eu.agile.IDM' '/eu/agile/idm' eu.agile.IDM.registerEntity   string:'{"id":"1","auth_type":"github","token":"token_here","entity_type":"sensor","name":"123"}'

var IDMDbusApi = function (configuration) {
   if(configuration && configuration !=null){
     this.conf  = configuration;
   }
   else{
        console.error("didn't find configuration for IDMBUsAPI... Entities  WILL NOT BE STORED!" );
  }
};


IDMDbusApi.prototype.run = function () {

  this.bus = dbus.sessionBus();
  this.name = 'eu.agile.IDM';
  this.bus.requestName(this.name, 0);

  this.idmInterface = {
    name: 'eu.agile.IDM',
    methods: {
        registerEntity: ['s', 'u'],
    }
  };

  var idm = {
    onAPIActionFinished: function(result){
	//TODO reply with some dbus message as response

	               console.log('api action finished with result :'+JSON.stringify(result));
    },
   //splits the array from dbus into an object containing keys in labels into a property called labeled, and the rest of the arguments is placed under other...
   filterByLabel: function (labels, dict){
        var returnValue = {"labeled":{},"other":{}};
	var j;
	var keys = Object.keys(dict);
	for(var i=0;i<keys.length; i++){
		j=0;
		key =keys[i];
		for(j=0;j<labels.length; j++){
			if(key == labels[j]){
				returnValue["labeled"][key] = dict[key];
				break;
			}
		}
		if(j==labels.length){
			returnValue["other"][key] = dict[key];
		}

	}

	return returnValue;
    },
    registerEntity: function(dict) {
	//console.log(this);
	dict = JSON.parse(dict);
        var action_type = 'create';
	var controlArgs = ["entity_type","token","auth_type","id"];
        var entity_type = '';
        var token = '';
	var filtered = this.filterByLabel(controlArgs, dict);
	if(Object.keys(filtered["labeled"]).length < controlArgs.length){
		console.log('not every argument required was provided to action '+action_type);
		return 1;
	}
	else{
		var entity = filtered["other"];
	        var api = new Api(this.conf.authentication, this.conf.validator, this.conf.authz,this.conf.storage);
		api.executeAction( filtered["labeled"]["auth_type"], "username_fake", filtered["labeled"]["token"],
			action_type, filtered["labeled"]["entity_type"],filtered["labeled"]["id"],
			entity,this.onAPIActionFinished.bind(this));

		//console.log(JSON.stringify(filtered["labeled"]));
		//console.log(JSON.stringify(filtered["other"]));
        	return 2;
	}
    }
  };
  idm.conf = this.conf;
  idm.bus = this.bus;
  this.bus.exportInterface(idm, '/eu/agile/idm', this.idmInterface);

}

module.exports = IDMDbusApi;

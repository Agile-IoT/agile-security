var dbus = require('dbus-native');


var IDMClient = function (configuration) {
   this.bus = dbus.sessionBus();
   if(configuration && configuration !=null){
     this.conf  = configuration;
   }
   else{
	//TODO have default setting
  }
};


IDMClient.prototype.registerEntity = function(entity, callbackRegisterEntityFinished){

 function responseReceived(err, res) {
     if(err){
	     callbackRegisterEntityFinished({success:false, error:err[0]});

     }else{
	     callbackRegisterEntityFinished({"success":true, "res":res});
     }
     
  };
  var message = { 
      path:'/eu/agile/idm',
      destination: 'eu.agile.IDM',
      'interface': 'eu.agile.IDM',
      member: 'registerEntity',
       signature: 's', 
      body: [ JSON.stringify(entity)],
      type: dbus.messageType.methodCall
  };
  this.bus.invoke(message, responseReceived.bind(this));


}


module.exports = IDMClient;
/*
var client = new IDMClient();
client.registerEntity({"id":"1","auth_type":"github","token":"token_here","entity_type":"sensor","name":"123"}, function(result){console.log('response'+JSON.stringify(result));}.bind(this));*/



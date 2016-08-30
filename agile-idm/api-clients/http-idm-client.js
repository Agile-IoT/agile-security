
const  request  = require('request');

var HTTPIDMClient = function (configuration) {

   if(configuration && configuration !=null){
     this.url = configuration["web-server"];
   }
   else{
	    console.error("cannot find configuration for identity mangement http client");
  }
};


HTTPIDMClient.prototype.registerEntity = function(entity, callbackRegisterEntityFinished){



}

HTTPIDMClient.prototype.authenticateEntity = function(authentication_type, token, onAuthenticationFinished){

    var url =  this.url;
    /*if(authentication_type && authentication_type !=null ){
      url = url  +authentication_type;
    }*/
    //console.log(url + token);
  	var options = {
                          url: url,
                          headers: {'Authorization': "bearer "+ token,
                  				   "User-Agent": "user-agent",
                  				  'content-type': 'application/json'
                          }
          };
  	function handleHttpResponse(onAuthenticationFinished, error, response, body) {
      			//console.log("args from IDM url:  "+JSON.stringify(arguments));
            if (!error && response.statusCode == 200) {

  						var result = {"success":true,"error":"","data":{}};
  						res = JSON.parse(body);
  						result.data = res;
  						onAuthenticationFinished(result);
  						return;
  				  }
  				  else if (!error) {
  			 	  	 var result = {"success":false,
  			 								     "error": "wrong satus code from authentication: "+response.statusCode+" error "+ body
  					   };
  					   if(response.statusCode == 401){
  					  	result.error = "bad credentials for authentication";
  					   }
  					   onAuthenticationFinished(result);
  					   return;
  				 }
           else{
  					  var result = {"success":false,"error":JSON.stringify(error)};
  					  onAuthenticationFinished(result);
  					  return;
          }
  			}
  	request.get(options,handleHttpResponse.bind(this,onAuthenticationFinished));


}

module.exports = HTTPIDMClient;
/*
var client = new IDMClient();
client.registerEntity({"id":"1","auth_type":"github","token":"token_here","entity_type":"sensor","name":"123"}, function(result){console.log('response'+JSON.stringify(result));}.bind(this));*/

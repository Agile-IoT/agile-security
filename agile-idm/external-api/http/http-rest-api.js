const Api = require('../../inner-api/api.js');
const FileStorage	 = require('../../inner-api/storage/file-storage.js');
const Validator = require('../../inner-api/validator/validator.js');
const Authentication = require('../../../agile-idm-commons/authentication.js');
const Authorization = require('../../inner-api/authorization/authorization.js');

var fs = require("fs");
var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var cors = require('cors');


var IDMHTTPApi = function (configuration){
  this.init(configuration);
  var router = express.Router();
  router.route('/a/').get(function(req, res) {

         res.json({a:123});
  });
  router.route('/sensor/:sensor_id').post(cors(),function(req, res) {

  function onActionFinished(result){
   	if(result.success){
 		   res.json({ message: 'Entity created!' });
     }
 	  else{
         	res.status(400).send(JSON.stringify({error:result.error}));
 	  }
  }

  var token = req.headers["authorization"];
  var auth_type = req.body.authentication_type;
  delete req.body.authentication_type;
  //console.log(JSON.stringify(req.body)+token);
  this.api.executeAction(auth_type,"user",token,"create","sensor",req.params.sensor_id,req.body,onActionFinished.bind(this));
 }).options(cors());

 // Authenticate a user by a cookie present in the database: curl -H "Authorization: 44470997675968826" localhost:9090/api/authenticateEntity/agile-cookie
 //Authenticate a user by a token provided by github (which is stored in the dtabase): curl -H "Authorization: 23f4fccvc31234vb23" localhost:9090/api/authenticateEntity/github

 router.route('/authenticateEntity/:auth_type/').get(cors(),function(req, res) {
   //console.log(JSON.stringify(this));
   function onActionFinished(req, res, result){
    	if(result.success){
  		   res.json(result.data);
      }
  	  else{
        res.status(401).send(JSON.stringify({error:"unauthorized "+ result.error}));
  	  }
   }

   var token = req.headers["authorization"];
   this.api.authentication.authenticateEntity(req.params.auth_type,null,token,onActionFinished.bind(this,req,res));
   console.log(token);
 }.bind(this)).options(cors());

  return this.setUpRoutes(router).bind(this);
}



  IDMHTTPApi.prototype.init = function(configuration) {

   if(configuration && configuration !=null){
     this.conf  = configuration;
   }
   else{
        console.warn("didn't find configuration for IDMHTTPApi... assuming... best guess");
      	var fp = '../../conf/validator-entities.conf';
      	var d = fs.readFileSync(fp,{encoding:'utf-8'})
      	var sch = JSON.parse(d);
      	this.conf = {
      	  filePath : fp,
      	  data : d,
      	  schema : sch,
      	  authentication : new Authentication(),
      	  validator : new Validator(sch),
      	  authz : new Authorization(),
      	  storage : new FileStorage()
      	};

  }
  this.api = new Api(this.conf.authentication, this.conf.validator, this.conf.authz,this.conf.storage);

}

IDMHTTPApi.prototype.setUpRoutes = function(router){



/*app.use('/api', router);
var port = 9090;
app.listen(port);
console.log('Gateway API Listening on port '+port);*/
return router;

}


module.exports = IDMHTTPApi;

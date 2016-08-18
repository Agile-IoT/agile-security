var passport = require('passport');
const IDMClient = require('../agile-idm/api-clients/dbus-session-client.js');
var client = new IDMClient();
var session = require('express-session')


var Demo =  function (app){

    //NOTE: here we use express-session to keep the user information available...
    app.get('/sensor/:sensor_id', function(req,res){
        res.json({"success":true, "data":"hi"})
    });
    app.post('/sensor/:sensor_id',   function (req, res) {
       console.log('got a post');
        var authData = req.user;
        if(authData){
           if(req.body && req.body["name"]){
            //console.log('body:'+JSON.stringify(req.body));
            client.registerEntity({"id":req.params.sensor_id,"auth_type":authData["auth_type"],"token":authData["token"],"entity_type":"sensor","name":req.body["name"]},function(result){
              res.json(result);
            });
          }
          else{
            res.send({success:false,error:'not all parameters have been received.'});
          }
       }
       else{
              res.send({success:false,error:'cannot find authentication info'});
       }
    });
    console.log('a');
}
module.exports = Demo;

var passport = require('passport');
const IdmCore = require('agile-idm-core');
var session = require('express-session')


var conf = require("./conf/agile-idm-core-conf");
var idmcore = new IdmCore(conf);

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
            var prom = idmcore.actionPromisse(authData["token"],"CREATE" , "/Sensor",req.params.sensor_id, {"name":req.body["name"]} );
            prom.then(function(data){
              res.send('data from api: '+JSON.stringify(data));
            }, function(error){
              res.json(error);
            })
          }
          else{
            res.send({success:false,error:'not all parameters have been received.'});
          }
       }
       else{
              res.send({success:false,error:'cannot find authentication info'});
       }
    });
}
module.exports = Demo;

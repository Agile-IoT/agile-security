/*

This is the server running the IDM component... So, here we run the API, the Oauth2, Web-ID, etc-related endpoints, and a demo function
The demo function illustrates how a particular express app can use the IDM machinery to authenticate users and use them to call the Dbus API from IDM through the client library...
*/

var express = require('express');
const bodyParser = require('body-parser');
const WebIDMExpress = require('./web-idm-express.js');
var https = require('https');
const fs = require("fs");

var conf = JSON.parse(fs.readFileSync('./conf/agile-ui.conf'));
var app = express();


//DEMO
const IDMClient = require('../agile-idm/api-clients/dbus-session-client.js');
var client = new IDMClient();
var idmExpress = new WebIDMExpress(app, conf,onIdmSetupFinished);

function onIdmSetupFinished(result){
   setupDemo();
}

//set up ssl with client-side cert for Web-Id
var key = fs.readFileSync(conf.tls.key);
var cert = fs.readFileSync(conf.tls.cert);

if(!key || key == "" || !cert || cert == "" ){
   console.error("cannot read the key and certitifates for tls :(");
}
var options = {
  key: key,
  cert: cert,
  requestCert: true
};
//run the APIs and web interfaces
https.createServer(options, app).listen(1443);
app.listen(3000);
console.log('Listening');



// do additional functionality
function setupDemo(){
  
  var jsonBodyEncoder = bodyParser.json();
    app.post('/sensor/:sensor_id', jsonBodyEncoder, function (req, res) {
        //console.log("visible object for authentication: "+req["agile-auth-obj"]);
       function onActionFinished(result){
         if(result.success){
           res.json({ success:true,message: 'Entity created!' });
         }
         else{
              res.send({succes:false,error:result.error});//TODO make this an actual error 50x http status code
         }
         console.log('api action finished '+JSON.stringify(result));
        }
        var authData = req.agile_login_data;
        if(authData){
           //console.log('authentication information for the user: '+JSON.stringify(req.agile_login_data));
           if(!authData["auth_type"] || !authData["token"]){
              res.send({success:false,error:'authentication information was not complete on the server side... :('});
           }
           else if(req.body && req.body["name"]){
            //console.log('body:'+JSON.stringify(req.body));
            client.registerEntity({"id":req.params.sensor_id,"auth_type":authData["auth_type"],"token":authData["token"],"entity_type":"sensor","name":req.body["name"]},onActionFinished.bind(this));
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

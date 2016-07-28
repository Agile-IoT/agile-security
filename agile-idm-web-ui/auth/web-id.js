//https://developer.github.com/v3/oauth/#check-an-authorization
//https://github.com/lelylan/simple-oauth2
const  request  = require('request');
var express = require('express');
var middleware = require('./web-id/ldp-middleware')
var https = require('https')
var fs = require('fs')
var session = require('express-session')
var uuid = require('node-uuid')
/* conf needs to have at least:

  clientID: client id for access code authorization flow
  clientSecret: client secret for auth flow
  site: where to redirect the user for log in
  tokenPath: path to exchange code for token

  host_name: scheme and name (or IP) of the gateway
  redirect_path: path to get the auth code
  scope: scope for authorization
  initial_path: path for the initial request. the one that will redirect to the IdP

  EVERY PATH STARTS WITH / AND HOSTNAMES DO NOT INCLUDE /
*/
function WebID(app, conf, storage){
  /* jolocom integration */
  var sessionSettings = {
  	secret: uuid.v1(),
  	saveUninitialized: false,
  	resave: false,
  	rolling: true
  }
  app.use( session(sessionSettings) )
  app.use(conf.initial_path,middleware());
  // end of integration
   //this tells this oauth2 module where to send the user with the cookie after authentication...

   var redirect_end = conf.host_name+conf.final_path;
   //console.log(conf.initial_path+redirect_end);
   // Initial page redirecting to Github

   app.get(conf.initial_path, function (req, res) {
     // this should work thanks to the web-id middleware...

    var certificate = req.connection.getPeerCertificate()
    var tokenstring=Math.random().toString();
    tokenstring = tokenstring.substring(2,tokenstring.length);
  	var token = {"token":tokenstring,"scope":"web_id","token_type":"web_id","auth_type":"web_id"}
  	token["user_id"]= certificate.subjectaltname;
    //console.log("expiration:"+certificate.valid_to);
  	token["expiration"]= "2029-07-12 16:46:37";//certificate expiration...
    token["expiration"]= certificate.valid_to;
  	var cookie_id=Math.random().toString();
    cookie_id=cookie_id.substring(2,cookie_id.length);
  	storage.storeToken(cookie_id, token["auth_type"], token,onStorageTokenFinished.bind(this,res,redirect_end,cookie_id));

   });


   function onStorageTokenFinished(res, redirect_end,cookie_id,result){
	if(result.success){
	  res.cookie('agile_auth',cookie_id, { maxAge: 900000, httpOnly: true });
	  res.redirect(redirect_end);
        }
	else{
	  res.status(500).send(result.error);
	  console.log('Error occurred while storing information for token', result.error);
	}
   }


}
module.exports = WebID;

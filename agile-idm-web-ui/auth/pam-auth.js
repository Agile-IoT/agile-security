//https://developer.github.com/v3/oauth/#check-an-authorization
//https://github.com/lelylan/simple-oauth2


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
var pam = require('authenticate-pam');
var bodyParser = require('body-parser');
var cors = require('cors');

//This component expects an AJAX call for now...
// it sets the cookie loke the oauth2 components and then returns a json object with the result of the authentication step

//curl   -H "Content-Type: application/json;charset=UTF-8" -d '{"username":"test2","password":"pass"}' -X POST http://localhost:8080/auth/user/
function PamAuth(app, conf, storage){

   this.redirect_end = conf.host_name+conf.final_path;
   this.redirect_error = conf.host_name+conf.error_path;
   //console.log(conf.initial_path);
   var urlencodedParser = bodyParser.urlencoded({ extended: false });

   var jsonParser = bodyParser.json();


   app.post(conf.initial_path, jsonParser, function (req, res) {
       function onAuthFinished(username,res,redirect_end, redirect_error, err) {
	 //console.log(redirect_end+""+redirect_error);
         //console.log('username'+username);
         if(err) {
             console.log(err);
	           res.send({"success":false, "error":"wrong username or password"});
         }
         else {
           //console.log("Authenticated!");
	         var cookie_id=Math.random().toString();
    	     cookie_id=cookie_id.substring(2,cookie_id.length);
           var token = {};
	         token["token"]=cookie_id;
	         token["scope"]="gateway_id";
	         token["token_type"]="agile_unix_pam";
	         token["auth_type"] = "unix_pam";
           token["user_id"] = username;
           //var d = new Date(Date.now()+900000);
           //token["expiration"] = d;
           console.log('logged in through pam auth as '+username);
	         storage.storeToken(cookie_id, token["auth_type"], token,onStorageTokenFinished.bind(this,res,redirect_end, redirect_error,cookie_id))
         }
       }

       var username = req.body.username;
       var password = req.body.password;
       pam.authenticate(username, password,onAuthFinished.bind(this,username,res,this.redirect_end, this.redirect_error));

   }.bind(this));

  	//storage.storeToken(cookie_id, "github", token,onStorageTokenFinished.bind(this,res,redirect_end,cookie_id))
   function onStorageTokenFinished(res, redirect_end, redirect_error, cookie_id,result){
        if(result.success){
	    res.cookie('agile_auth',cookie_id, { maxAge: 900000, httpOnly: true });
	    res.send({"success":true});
	}
	else{
	     res.send(result);
	}
 }

}
module.exports = PamAuth;

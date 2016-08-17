
const Authentication = require('../../agile-idm-commons/authentication.js');

var TokenValidator = function (conf) {
   this.login_site = conf["login"]["site"];
   this.authentication = new Authentication({ "source":"token-storage","token-storage":conf["token-storage"]});
   this.conf = conf;

};

/// this is a local function to decide whether or not a url can be used without authentication.
TokenValidator.prototype.shouldSkip = function(url){

  if(url == this.login_site){
     return true;
  }
  for(var i = 0; i< this.conf.login.exclude_prefix.length; i++)
  {
     if(url.indexOf(this.conf.login.exclude_prefix[i])==0){
	     return true;
    }
  }

  var oauth = this.conf["auth"];
  var providers = Object.keys(oauth);
  for(var i = 0; i< providers.length; i++){
  	var keys = Object.keys(oauth[providers[i]]);
  	for(var j = 0; j< keys.length; j++){
  		if(url.indexOf(oauth[providers[i]][keys[j]])==0){
  			return true;
  		}
    }
  }
  return false;
}
/*
* This function utilizes the authentication module and decides whether or not the request should be redirected to the login page
* It also places the data for the authentication information under req.agile_login_data as an object in case authentication is succesful
*/
TokenValidator.prototype.validate = function(req, res, next) {

  if(req.cookies.agile_auth){
    var cookie = req.cookies.agile_auth;
     this.authentication.authenticateEntity("agile-cookie", null, cookie, onCookieReadOrError.bind(this));
  }
  else{
      if(this.shouldSkip(req.url)){
	       next();
	       return;
      }
      else{
         console.warn("cannot a valid cookie. Redirecting to "+this.log_site);
         res.redirect(this.login_site);
      }
 }


 function onCookieReadOrError(result){
     if(!result.success){
        if(this.shouldSkip(req.url)){
           next();
           return;
        }
       else{
           console.warn("error while reading authentication information from cookie :"+result.error);
           res.redirect(this.login_site);
       }
     }
     else{
        req.agile_login_data = result.data;
     }
     next();
 }
}

module.exports = TokenValidator

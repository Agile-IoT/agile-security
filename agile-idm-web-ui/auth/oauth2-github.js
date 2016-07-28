//https://developer.github.com/v3/oauth/#check-an-authorization
//https://github.com/lelylan/simple-oauth2
const  request  = require('request');

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
function GithubOauth2(app, conf, storage){
   //this tells this oauth2 module where to send the user with the cookie after authentication...
   var redirect_end = conf.host_name+conf.final_path;

   //set configuraions...
   var clientOptions = {
      clientID: conf.clientID,
      clientSecret: conf.clientSecret,
      site: conf.site,
      tokenPath: conf.tokenPath
   }
   var oauth2 = require('simple-oauth2')(clientOptions);
   var authorization_uri = oauth2.authCode.authorizeURL({
      redirect_uri: conf.host_name+conf.redirect_path,
      scope: conf.scope
   });

  /*
   the response provided in the callback should contain (in data):
	* username
	* id
	* auth_type
  */
  function exchangeTokenByPrincipal(credentials,onAuthenticationFinished) {

	//console.log('trying credentials'+credentials);
	var options = {
                        url: "https://api.github.com/user",
                        headers: {'Authorization': "token "+credentials,
				   "User-Agent": "user-agent",
				  'content-type': 'application/json'}
        };
	function handleHttpResponse(error, response, body) {
                                  if (!error && response.statusCode == 200) {
					var result = {"success":true,"error":"","data":{}};
					res = JSON.parse(body);
					result.data["id"] = res.login;
					onAuthenticationFinished(result);
					return;
                                  }
				  else if (!error) {
				  	var result = {"success":false,
						"error": "wrong satus code from authentication: "+response.statusCode+" error "+ body};
					if(response.statusCode == 401){
						result.error = "bad credentials for github authentication";
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
	request.get(options,handleHttpResponse);
    }



   // Initial page redirecting to Github
   app.get(conf.initial_path, function (req, res) {
    res.redirect(authorization_uri);
   });

   //exchange code by token
   app.get(conf.redirect_path, function (req, res) {
    var code = req.query.code;
    //console.log(req);
    oauth2.authCode.getToken({
       code: code,
       redirect_uri: conf.host_name + conf.redirect_path
     }, saveToken.bind(this,res, storage,redirect_end));


    function getParameterByName(name, url) {

      name = name.replace(/[\[\]]/g, "\\$&");
      var vars = url.split('&');
      for(var i=0; i<vars.length; i++){
          var assign = vars[i].split('=');
          if(assign[0] == name){
             return assign[1];
          }
      }
      return null;
    }

    function parseResult(result){
	var res = {};
	res.token = getParameterByName("access_token",result);
	res.scope = getParameterByName("scope",result);
	res.token_type = getParameterByName("token_type",result);
	res.auth_type = "github";
        return res;
     }

    //save the token after the end of the flow
    function saveToken(res,storage, redirect_end, error, result) {
      //TODO improve error handling!
      if (error) {
	   res.status(error.status).send(error.message);
	   console.log('Access Token Error', error.message);
      }
      else{
        //token = oauth2.accessToken.create(result);
        var token = parseResult(result);
	      //console.log("token parsed:"+JSON.stringify(token));
	      exchangeTokenByPrincipal(token.token,exchangeTokenByPrincipalFinished.bind(this,res,redirect_end,token));
      }
     }

   });

   function exchangeTokenByPrincipalFinished(res,redirect_end,token, result){
	if(result.success && result.data){
		token["user_id"]= result.data.id;
		token["expiration"]= "2016-07-12 16:46:37";
		var cookie_id=Math.random().toString();
	  cookie_id=cookie_id.substring(2,cookie_id.length);
    console.log('authenticated with github as '+result.data.id);
		storage.storeToken(cookie_id, "github", token,onStorageTokenFinished.bind(this,res,redirect_end,cookie_id));
	}else{
	  	res.status(500).send({"success":false, error: result.error});
	        console.log('Cannot retrieve user information from IdP');
	}
   }

   function onStorageTokenFinished(res, redirect_end,cookie_id,result){
	if(result.success){
	  res.cookie('agile_auth',cookie_id, { maxAge: 900000, httpOnly: true });
          res.redirect(redirect_end);
        }
	else{
	  res.status(500).send(result.error);
	  console.log('Error occurred while storing token', result.error);
	}
   }


}
module.exports = GithubOauth2;

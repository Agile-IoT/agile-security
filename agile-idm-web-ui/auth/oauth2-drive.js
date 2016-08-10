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
function DriveOauth2(app, conf, storage){
	//this tells this oauth2 module where to send the user with the cookie after authentication...
	var redirect_end = conf.host_name+conf.final_path;

	//set configuraions...
	var clientOptions = {
		clientID: conf.clientID,
		clientSecret: conf.clientSecret,
		site: conf.site,
		tokenPath: conf.tokenPath,
		authorizationPath: conf.authorizationPath
	}
	var oauth2 = require('simple-oauth2')(clientOptions);
	var authorization_uri = oauth2.authCode.authorizeURL({
		redirect_uri: conf.host_name+conf.redirect_path,
		scope: conf.scope
	});	
	
	// Initial page redirecting to Google Drive
	app.get(conf.initial_path, function (req, res) {
		res.redirect(authorization_uri);
	});

	//exchange code by token
	app.get(conf.redirect_path, function (req, res) {
		var code = req.query.code;
		oauth2.authCode.getToken({
			code: code,
			redirect_uri: conf.host_name + conf.redirect_path
		}, saveToken.bind(this, res));
	});
	
	//save the token after the end of the flow
	function saveToken(res, error, result) {
		//TODO improve error handling!
		if (error) {
			res.status(error.status).send(error.message);
			console.log('Access Token Error', error.message);
		}
		else{
			var token = parseResult(result);
			exchangeTokenByPrincipal(token.token, exchangeTokenByPrincipalFinished.bind(this, res, token));
		}
	}
	
	function parseResult(result){
			var res = {};
			res.token = result.access_token;
			res.token_type = result.token_type;
			res.auth_type = "drive";
	    return res;
		}

	function exchangeTokenByPrincipal(credentials, onAuthenticationFinished){
		var getUserInfo = new Promise((resolve, reject) => {
			var options = {
				url: "https://www.googleapis.com/oauth2/v3/userinfo",
				headers: {
					"Authorization": "Bearer "+credentials, 
					"User-Agent": "user-agent",
					"content-type": "application/json"
				}
			};
			request.get(options, function(error, response, body){
				if (!error && response.statusCode == 200) {
					var result = {"success":true,"error":"","data":{}};					
					res = JSON.parse(body);
					result.data["username"] = res["name"];
					result.data["id"] = res["sub"];
					if("email" in res && "email_verified" in res && res["email_verified"]){
						result.data["email"] = res["email"];
					}
					resolve(result);						
				}
				else if (!error) {
					var result = {"success":false, "error": "wrong satus code from authentication: "+response.statusCode+" error "+ body};
					if(response.statusCode == 401){
						result.error = "bad credentials for drive authentication";
					}
					reject(result);
				}
				else{
					var result = {"success":false,"error":JSON.stringify(error)};
					reject(result);
				}
			});
		}); 
		
		var getTokenInfo = new Promise((resolve, reject) => {
			var options = {
				url: "https://www.googleapis.com/oauth2/v3/tokeninfo",
				qs: {
					'access_token': credentials
				}                               
			};
			request.get(options, function(error, response, body){
				if (!error && response.statusCode == 200){
					res = JSON.parse(body);
					resolve({"expiration": res["exp"], "scope": res["scope"]});
				}
				else if (!error) {
					var result = {"success":false, "error": "wrong satus code from authentication: "+response.statusCode+" error "+ body};
					if(response.statusCode == 401){
						result.error = "bad credentials for drive authentication";
					}
					reject(result);
				}
				else{
					var result = {"success":false,"error":JSON.stringify(error)};
					reject(result);
				}
			});
		}); 
		
		Promise.all([getUserInfo, getTokenInfo]).then(
			function(results){
				onAuthenticationFinished(results);
			}, 
			function(reason){
				onAuthenticationFinished(reason);
			}
		);		
	}  

	function exchangeTokenByPrincipalFinished(res, token, result){		
		if(result[0].success && result[0].data){
			token["user_id"] = result[0].data.id;
			token["expiration"] = result[1].expiration;
			token["scope"] = result[1].scope;
			var cookie_id = Math.random().toString();
			cookie_id = cookie_id.substring(2, cookie_id.length);
			console.log('authenticated with Google Drive as '+result[0].data.id);
			storage.storeToken(cookie_id, "drive", token, onStorageTokenFinished.bind(this, res, cookie_id));
		}
		else{
			res.status(500).send({"success":false, error: result.error});
			console.log('Cannot retrieve user information from IdP');
		}
	}

	function onStorageTokenFinished(res, cookie_id, result){
		if(result.success){
			res.cookie('agile_auth', cookie_id, { maxAge: 900000, httpOnly: true });
			res.redirect(redirect_end);
		}
		else{
			res.status(500).send(result.error);
			console.log('Error occurred while storing token', result.error);
		}
	}
}
module.exports = DriveOauth2;

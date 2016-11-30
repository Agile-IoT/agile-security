var RouterProviers = require('./routes/providers/');
var RouterApi = require('./routes/api/');
var routerOauth2 = require('./routes/oauth2-routes');
var routerSite = require('./routes/site-routes');
var serializer =  require('./lib/auth/serializer');
var authStrategies =require('./lib/auth/providers/');
var oauth2ServerStrategies = require('./lib/auth/oauth2/strategies');
var oauth2orizeServer = require('./lib/auth/oauth2/oauth2orize');

module.exports = {
	 routerProviers : RouterProviers,
	 routerApi :RouterApi,
	 routerOauth2 : routerOauth2,
	 routerSite : routerSite,
	 serializer : serializer,
	 authStrategies : authStrategies,
	 oauth2ServerStrategies:oauth2ServerStrategies,
	 oauth2orizeServer :oauth2orizeServer
}

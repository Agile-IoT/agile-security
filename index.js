var RouterProviders = require('./routes/providers/');
var RouterApi = require('./routes/api/');
var RouterPoliciesApi = require('./routes/policies/');
var routerOauth2 = require('./routes/oauth2-routes');
var routerSite = require('./routes/site-routes');
var serializer =  require('./lib/auth/serializer');
var authStrategies =require('./lib/auth/providers/');
var oauth2ServerStrategies = require('./lib/auth/oauth2/strategies');
var oauth2orizeServer = require('./lib/auth/oauth2/oauth2orize');
var configurator = require('./lib/util/configurator');
var tokens = require('./lib/util/tokens');
module.exports = {
	 routerProviders : RouterProviders,
	 routerApi :RouterApi,
	 RouterPoliciesApi : RouterPoliciesApi,
	 routerOauth2 : routerOauth2,
	 routerSite : routerSite,
	 serializer : serializer,
	 authStrategies : authStrategies,
	 oauth2ServerStrategies:oauth2ServerStrategies,
	 oauth2orizeServer :oauth2orizeServer,
	 configure :configurator,
	 tokens: tokens

};

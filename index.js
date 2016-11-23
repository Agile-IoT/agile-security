var RouterProviers = require('./routes/provider-routes');
var RouterApi = require('./routes/api-routes');
var serializer =  require('./lib/auth/providers/serializer');
var authStrategies =require('./lib/auth/providers/strategies');
var apiStrategies = require('./lib/auth/api/bearer-strategy');

module.exports = {
	 RouterProviers : RouterProviers,
	 RouterApi :RouterApi,
	 serializer : serializer,
	 authStrategies : authStrategies,
	 apiStrategies : apiStrategies,
}

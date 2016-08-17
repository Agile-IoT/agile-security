var fs = require('fs');
const Api = require('../inner-api/api.js');
const Sqlite3Storage	 = require('../inner-api/storage/sqlite3-storage.js');
const Validator = require('../inner-api/validator/validator.js');
const TokenStorage = require('../../agile-idm-web-ui/auth/token-storage.js');
const Authentication = require('../../agile-idm-commons/authentication.js');
const Authorization = require('../inner-api/authorization/authorization.js');
const IDMDbusApi= require('./d-bus/idm-session-dbus.js');

function ExternalAPI(){

	function dbCreated(){
		//console.log('Database Loaded...');
		this.conf = {
		  schema : this.validator_schema,
	  	authentication : this.authentication,
		  validator : new Validator(this.validator_schema),
		  authz : new Authorization(),
		  storage : this.sqlite
		};
		var api = new IDMDbusApi(this.conf);
		api.run();
		console.log('D-bus IDM server started');

	}

	var validator_file = '../conf/validator-entities.conf';
	var api_conf_file = '../conf/api.conf';

	var validator_conf_data = fs.readFileSync(validator_file,{encoding:'utf-8'})
	this.validator_schema = JSON.parse(validator_conf_data);
	var api_conf_data = fs.readFileSync(api_conf_file,{encoding:'utf-8'})
	this.api_conf_properties = JSON.parse(api_conf_data);
  this.authentication = new Authentication(this.api_conf_properties["authentication"]);
	this.sqlite = new Sqlite3Storage(this.api_conf_properties["sqlite3"]);
	this.sqlite.init(dbCreated.bind(this));

}
ExternalAPI();

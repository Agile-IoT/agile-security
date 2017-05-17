// dependencies
var express = require('express');
var path = require('path');
var passport = require('passport');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var logger = require('morgan');
var methodOverride = require('method-override');
var idmWeb = require('./index');
var errorHandler = require('./routes/errorHandler');

/*
 use during development:
 -  var idmWeb = require('../index');
 -  & make sure that you use the package.json without requiring passport!! use package.json

for production:
- var idmWeb = require('agile-idm-web-ui'); to bring the module from github
- use the package-prod.json with passport!

*/

//load configurations
var conf;
//to find the configuration file (if it is provided as argument, then it is used.)
var location = './conf';
if(process.argv.length >2){
  location = process.argv[2];
}
try{
  //this one is ignored safely... where you can have your own tokens for Oauth2 :)
  conf = require(location+'/my-agile-ui-conf');
}
catch(error){
  conf = require(location+'/agile-ui-conf');
}

var core_conf = require(location+'/agile-idm-core-conf');

var https = require('https');
var app = express();
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(methodOverride());
app.use(session({
  secret: idmWeb.tokens.uid(26),
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
//NOTE: could help for error handling
/*var flash = require('connect-flash');
app.use(flash());*/
//also enable failureFlash in the proper part of  routes/provider-routes.js
app.use(passport.session());

//set serializer for users and clients
idmWeb.serializer(conf,core_conf);
//set up external providers with passport
var strategies = idmWeb.authStrategies(conf,core_conf);

//set ahentication endpoints to authenticate with different means (webid, oauth2, etc)
app.use("/auth", idmWeb.routerProviders(strategies, conf));

//set up entities API
app.use("/api/v1", idmWeb.routerApi(conf, core_conf,strategies));

//set up static sites
app.use("/static", express.static(path.join(__dirname, './static')));

//oauth2orize server (this allows IDM to work as an Oauth2 provider to apps)
var oauth2 = idmWeb.oauth2orizeServer(conf,core_conf);
idmWeb.oauth2ServerStrategies(conf,core_conf);
app.use("/oauth2",idmWeb.routerOauth2(conf,core_conf));
app.use("/",idmWeb.routerSite(strategies, conf));
app.use(errorHandler);


var options = {
  key: fs.readFileSync(conf.tls.key),
  cert: fs.readFileSync(conf.tls.cert),
  requestCert: true
};
app.listen(conf.http_port);
https.createServer(options, app).listen(conf.https_port_with_client);
options.requestCert = false;
idmWeb.configure(core_conf);
https.createServer(options, app).listen(conf.https_port);

console.log("listening on port "+conf.http_port+ " for http ");
console.log("listening on port "+conf.https_port+ " for https ");
console.log("listening on port "+conf.https_port_with_client+ " for https and client certificate request for webid ");


module.exports = app;

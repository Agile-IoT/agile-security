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

/*
 use during development:
 -  var idmWeb = require('../index');
 -  & make sure that you use the package.json without requiring passport!! use package.json

for production:
- var idmWeb = require('agile-idm-web-ui'); to bring the module from github
- use the package-prod.json with passport!

*/

//load configurations
var conf = require('./conf/agile-ui-conf');
var core_conf = require('./conf/agile-idm-core-conf');

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
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
//NOTE: could help for error handling
//var flash = require('connect-flash');
//app.use(flash());
//also enable failureFlash in the proper part of  routes/provider-routes.js
app.use(passport.session());

//set serializer for users and clients
idmWeb.serializer(conf,core_conf);
//set up external providers with passport
idmWeb.authStrategies(conf,core_conf);

//set ahentication endpoints to authenticate with different means (webid, oauth2, etc)
app.use("/auth", idmWeb.routerProviers(conf));

//set up entities API
idmWeb.apiStrategies(conf);
app.use("/api", idmWeb.routerApi(app));

//set up static sites
app.use("/static", express.static(path.join(__dirname, './lib/static')));

//oauth2orize server (this allows IDM to work as an Oauth2 provider to apps)
var oauth2 = idmWeb.oauth2orizeServer(conf,core_conf);
idmWeb.oauth2ServerStrategies(conf,core_conf);
app.use("/oauth2",idmWeb.routerOauth2(conf,core_conf));
app.use("/",idmWeb.routerSite(conf,core_conf));


/*app.get("/", function (req, res) {
  res.redirect("/static/index.html");
});*/


//NOTE example on how to access authentication info in express... :)
app.get('/account', ensureAuthenticated, function (req, res) {
  console.log(req.session.passport.user);
  res.send(req.session.passport.user);
});

var options = {
  key: fs.readFileSync(conf.tls.key),
  cert: fs.readFileSync(conf.tls.cert),
  requestCert: true
};
app.listen(3000);
https.createServer(options, app).listen(1443);

// test authentication
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

module.exports = app;

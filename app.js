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
var RouterProviers = idmWeb.RouterProviers;
var RouterApi = idmWeb.RouterApi;
var conf = require('./conf/agile-ui-conf');
var https = require('https');
var app = express();

app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser());
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
app.set('view engine', 'ejs');

//set up external providers with passport
idmWeb.serializer(conf);
idmWeb.authStrategies(conf);
var providersRouter = new RouterProviers(conf, app);
app.use("/auth", providersRouter);

//set up authentication API
idmWeb.apiStrategies(conf);
var apiRouter = new RouterApi(app);
app.use("/api", apiRouter);

//set up static sites
app.use("/static", express.static(path.join(__dirname, './lib/static')));


app.get("/", function (req, res) {
  res.redirect("/static/index.html");
});

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

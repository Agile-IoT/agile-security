// dependencies
var express = require('express');
//var routes = require('./routes');
var path = require('path');
var passport = require('passport');

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const logger = require('morgan');
const methodOverride = require('method-override');
const AuthenticationMiddleware = require('./auth/auth-middleware.js');
const RouterProviers = require('./routes/provider-routes');
const RouterApi = require('./routes/api-routes');

var app = express();


  ///app.set('views', __dirname + '/views');
  //app.set('view engine', 'jade');
  app.use(logger('dev'));
  app.use(cookieParser());
  app.use(bodyParser());
  app.use(methodOverride());
  app.use(session({  secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  //set up external providers with passport
  require('./auth/providers/serializer')
  require('./auth/providers/strategies')
  var providersRouter = new RouterProviers(app);
  app.use(providersRouter);

  //set up authentication API
  require('./auth/api/bearer-strategy')
  var apiRouter = new RouterApi(app);
  app.use("/api",apiRouter);

  //set up static sites
  app.use("/static",express.static(path.join(__dirname, './static')));
  //TODO check this... https://github.com/expressjs/express/issues/2760


  var Demo = require('./demo');
  d= new Demo(app);


  //app.use('/api', router);
// routes
//app.get('/', routes.index);
//app.get('/ping', routes.ping);
app.get('/account', ensureAuthenticated, function(req, res){
  console.log(req.session.passport.user);
  res.send(req.session.passport.user);
  /*User.findById(req.session.passport.user, function(err, user) {
    if(err) {
      console.log(err);  // handle errors
    } else {
      res.render('account', { user: user});
    }
  });*/
});





// port
app.listen(3000);

// test authentication
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/');
}

module.exports = app;

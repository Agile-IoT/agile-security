var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var tokens = require('../../util/tokens');
var ids = require('../../util/id');
var console = require('../../log');
var createError = require('http-errors');
var url = require('url');
var pam;

function loadStrategy(conf, entityStorageConf) {
  var auth_type = "pam";
  var db = require('../../db')(conf, entityStorageConf);
  var enabled = conf.enabledStrategies.filter(function (v) {
    return (v === auth_type);
  });
  if (enabled.length === 0) {
    console.log('ignoring ' + auth_type + ' strategy for user authentication. Not enabled in the configuration');
    return false;
  } else {
    try {
      //This fails if the module is not installed (and the libpam0g-dev library in debian)
      pam = require('authenticate-pam');
      passport.use(auth_type, new LocalStrategy({
        passReqToCallback: true
      }, function (req, username, password, done) {
        var oauth2ReturnToParsed = url.parse(req.session.returnTo, true).query;
        console.log(" sesion in strategy  " + auth_type + JSON.stringify(oauth2ReturnToParsed));
        console.log(" client id from session in " + auth_type + JSON.stringify(oauth2ReturnToParsed.client_id));
        console.log(" response_type for oauth2 in " + auth_type + JSON.stringify(oauth2ReturnToParsed.response_type));
        var id = {
          user_name: username,
          auth_type: auth_type
        };
        var default_exp = null;
        db.users.findByUsernameAndAuthType(username, auth_type, function (err, user) {
          if (err) {
            return done(err);
          }
          if (!user) {
            return done(null, false);
          }
          var accessToken = tokens.uid(30);
          db.accessTokens.saveOauth2Token(accessToken, user.id, oauth2ReturnToParsed.client_id, "bearer", [conf.gateway_id], default_exp, null, oauth2ReturnToParsed.response_type, function (err) {
            if (err) {
              return done(err);
            }
            return done(null, user);
          });
        });
      }));
      console.log('finished registering passport ' + auth_type + ' strategy');
      return true;

    } catch (e) {
      console.log('FAIL TO register a strategy');
      console.log('ERROR: error loading ' + auth_type + ' passport strategy: ' + e);
      return false;
    }
  }
}
module.exports = loadStrategy;

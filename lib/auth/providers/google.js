var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var tokens = require('../../util/tokens');
var ids = require('../../util/id');
var dateUtils = require('../../util/date');
var console = require('../../log');
var createError = require('http-errors');

function loadStrategy(conf, entityStorageConf) {
  var auth_type = "google";
  var db = require('../../db')(conf, entityStorageConf);
  var enabled = conf.enabledStrategies.filter(function (v) {
    return (v === auth_type);
  });
  if (enabled.length === 0) {
    console.log('ignoring ' + auth_type + ' strategy for user authentication. Not enabled in the configuration');
    return false;
  } else {
    try {
      passport.use(auth_type,new GoogleStrategy({
          clientID: conf.auth.google.clientID,
          clientSecret: conf.auth.google.clientSecret,
          callbackURL: conf.auth.google.redirect_path,
          scope: conf.auth.google.scope,
          passReqToCallback: false
        },
        function ( /*request,*/ accessToken, refreshToken, tokenObject, profile, done) {
          var username = profile.email;
          if (username.indexOf("@") > 1)
            username = username.split("@")[0];
          var id = {
            user_name: username,
            auth_type: auth_type
          };

          var default_exp = 1200;
          if (tokenObject.hasOwnProperty("expires_in")) {
            var exp = (tokenObject.expires_in);
            default_exp = dateUtils.sqliteDateNowPlusSeconds(exp);
          }
          db.users.findByUsernameAndAuthType(username, auth_type, function (err, user) {
            if (err) {
              return done(err);
            }
            if (!user) {
              return done(null, false);
            }
            db.accessTokens.save(accessToken, user.id, null, "bearer", conf.auth.google.scope, default_exp, refreshToken, function (err) {
              if (err) {
                return done(err);
              }
              return done(null, user);
            });
          });
        }
      ));
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

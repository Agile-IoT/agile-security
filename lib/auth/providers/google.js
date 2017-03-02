var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var tokens = require('../../util/tokens');
var ids = require('../../util/id');
var dateUtils = require('../../util/date');
var console = require('../../log');
var createError = require('http-errors');
var url = require('url');

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
      passport.use(auth_type, new GoogleStrategy({
          clientID: conf.auth.google.clientID,
          clientSecret: conf.auth.google.clientSecret,
          callbackURL: conf.auth.google.redirect_path,
          scope: conf.auth.google.scope,
          passReqToCallback: true
        },
        function (req, accessToken, refreshToken, tokenObject, profile, done) {
          var oauth2ReturnToParsed = url.parse(req.session.returnTo, true).query;
          console.log(" sesion in strategy  " + auth_type + JSON.stringify(oauth2ReturnToParsed));
          console.log(" client id from session in " + auth_type + JSON.stringify(oauth2ReturnToParsed.client_id));
          console.log(" response_type for oauth2 in " + auth_type + JSON.stringify(oauth2ReturnToParsed.response_type));
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
            default_exp = dateUtils.currentpochMilisPlusSeconds(exp);
          }
          db.users.findByUsernameAndAuthType(username, auth_type, function (err, user) {
            if (err) {
              return done(err);
            }
            if (!user) {
              return done(null, false);
            }
            db.accessTokens.saveOauth2Token(accessToken, user.id, oauth2ReturnToParsed.client_id, "bearer", conf.auth.google.scope, default_exp, refreshToken, oauth2ReturnToParsed.response_type, function (err) {
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

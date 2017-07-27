var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var fs = require('fs');
var dateUtils = require('../../util/date');
var tokens = require('../../util/tokens');
var console = require('../../log');
var createError = require('http-errors');
var dateUtils = require('../../util/date');
var url = require('url');
var bcrypt = require('bcrypt');

function loadStrategy(conf, entityStorageConf) {
  var db = require('../../db')(conf, entityStorageConf);
  var auth_type = "agile-local";
  var enabled = conf.enabledStrategies.filter(function (v) {
    return (v === auth_type);
  });
  if (enabled.length === 0) {
    console.log('ignoring ' + auth_type + ' strategy for user authentication. Not enabled in the configuration');
    return false;
  } else {
    try {

      passport.use(auth_type, new LocalStrategy({
        passReqToCallback: true
      }, function (req, username, password, done) {

        var oauth2ReturnToParsed = url.parse(req.session.returnTo, true).query;
        console.log(" sesion in strategy  " + auth_type + JSON.stringify(oauth2ReturnToParsed));
        console.log(" client id from session in " + auth_type + JSON.stringify(oauth2ReturnToParsed.client_id));
        console.log(" response_type for oauth2 in " + auth_type + JSON.stringify(oauth2ReturnToParsed.response_type));
        var default_exp = null;
        // By defaylt, TOKEN expires in one hour but for development this can be disabled
        if (process.env.INSECURE_TOKEN_NO_EXPIRE !== "1") {
          default_exp = dateUtils.currentpochMilisPlusSeconds(3600);
        } else {
          console.log("leaving token without expiration! under your own risk!!");
        }

        db.users.findByUsernameAndAuthType(username, auth_type, function (err, user) {
          if (err) {
            return done(err);
          }
          if (!user) {
            return done(null, false);
          }
          bcrypt.compare(password, user.password, function (err, res) {
            if (err || !res) {
              return done(null, false);
            } else {
              var token = tokens.uid(64);
              db.accessTokens.saveOauth2Token(token, user.id, oauth2ReturnToParsed.client_id, "bearer", [conf.gateway_id], default_exp, null, oauth2ReturnToParsed.response_type, function (err) {
                if (err) {
                  return done(err);
                }
                return done(null, user);
              });
            }
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

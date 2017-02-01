var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var fs = require('fs');
var dateUtils = require('../../util/date');
var tokens = require('../../util/tokens');
var console = require('../../log');
var createError = require('http-errors');

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

      passport.use(auth_type, new LocalStrategy(
        function (username, password, done) {
          var default_exp = null;
          db.users.findByUsernameAndAuthType(username, auth_type, function (err, user) {
            if (err) {
              return done(err);
            }
            if (!user) {
              return done(null, false);
            }
            if (user.password !== password) {
              return done(null, false);
            }
            var token = tokens.uid(64);
            db.accessTokens.save(token, user.id, null, "bearer", [conf.gateway_id], default_exp, null, function (err) {
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

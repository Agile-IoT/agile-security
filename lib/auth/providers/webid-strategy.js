var passport = require('passport');
var WebIDStrategy = require('passport-webid').Strategy;
var tokens = require('../../util/tokens');
var ids = require('../../util/id');
var console = require('../../log');
var createError = require('http-errors');
var dateUtils = require('../../util/date');

function loadStrategy(conf, entityStorageConf) {
  var auth_type = "webid";
  var db = require('../../db')(conf, entityStorageConf);
  var enabled = conf.enabledStrategies.filter(function (v) {
    return (v === auth_type);
  });
  if (enabled.length === 0) {
    console.log('ignoring ' + auth_type + ' strategy for user authentication. Not enabled in the configuration');
  } else {
    try {
      passport.use(new WebIDStrategy(
        function (webid, certificate, req, done) {
          var id = {
            user_name: webid,
            auth_type: auth_type
          };
          var accessToken = tokens.uid(30);
          var d = Date.parse(certificate.valid_to);
          var default_exp = dateUtils.dateToSqlite(d);
          db.users.findByUsernameAndAuthType(webid, auth_type, function (err, user) {
            if (err) {
              return done(err);
            }
            if (!user) {
              return done(null, false);
            }

            db.accessTokens.save(accessToken, user.id, null, "bearer", [conf.gateway_id], default_exp, null, function (err) {
              if (err) {
                return done(err);
              }
              return done(null, user);
            });
          });
        }
      ));
      console.log('finished registering passport ' + auth_type + ' strategy');

    } catch (e) {
      console.log('FAIL TO register a strategy');
      console.log('ERROR: error loading ' + auth_type + ' passport strategy: ' + e);
    }
  }

}
module.exports = loadStrategy;

var passport = require('passport');
var GithubStrategy = require('passport-github2').Strategy;
var tokens = require('../../util/tokens');
var ids = require('../../util/id');
var console = require('../../log');
var createError = require('http-errors');

function loadStrategy(conf, entityStorageConf) {
  var auth_type = "github";
  var db = require('../../db')(conf, entityStorageConf);
  var enabled = conf.enabledStrategies.filter(function (v) {
    return (v === auth_type);
  });
  if (enabled.length === 0) {
    console.log('ignoring ' + auth_type + ' strategy for user authentication. Not enabled in the configuration');
  } else {
    try {
      passport.use(new GithubStrategy({
          clientID: conf.auth.github.clientID,
          clientSecret: conf.auth.github.clientSecret,
          callbackURL: conf.auth.github.redirect_path,
          scope: conf.auth.google.scope
        },
        function (accessToken, refreshToken, profile, done) {

          var id = {
            user_name: profile.username,
            auth_type: auth_type
          };

          var default_exp = null;
          var user = {
            "user_name": profile.username,
            "auth_type": auth_type,
            "id": ids.buildId(profile.username, auth_type),
            "type": "/User",
            "owner": ids.buildId(profile.username, auth_type)
          };
          db.accessTokens.save(accessToken, user.id, null, "bearer", conf.auth.github.scope, default_exp, refreshToken, function (err) {
            if (err) {
              return done(err);
            }
            return done(null, user);
          });
        }
      ));
      console.log('finished registering passport ' + auth_type + ' strategy');

    } catch (e) {
      console.log('FAIL TO register a strategy');
      console.error('ERROR: error loading ' + auth_type + ' passport strategy: ' + e);
    }
  }

}
module.exports = loadStrategy;

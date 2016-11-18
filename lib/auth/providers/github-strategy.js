var passport = require('passport');
var GithubStrategy = require('passport-github2').Strategy;
var connectionPoolPromisse = require('../token-connection-pool');
var tokens = require('../../util/token-generator');
var console = require('../../log');
var createError = require('http-errors');

function loadStrategy(conf) {
  connectionPoolPromisse(conf).then(function (storage) {
    if (!conf.auth.github) {
      console.log('there is no auth.github property in the config. Ignoring Github authentication');
    } else {
      try {
        passport.use(new GithubStrategy({
            clientID: conf.auth.github.clientID,
            clientSecret: conf.auth.github.clientSecret,
            callbackURL: conf.auth.github.redirect_path,
            scope: conf.auth.google.scope
          },
          function (accessToken, refreshToken, profile, done) {
            //storage.getTokenByUser(id, function (result) {
            //  if (result.success)
            //    console.log("there was a token from  github already" + JSON.stringify(result.data));
            //  });
            //console.log(JSON.stringify(profile));
            var auth_type = "github";
            var token = {};
            var id = {
              user_name: profile.username,
              auth_type: auth_type
            };

            token.user_name = profile.username;
            token.expiration = null;
            token.scope = conf.auth.github.scope;
            token.token_type = "bearer";
            token.auth_type = auth_type;
            token.token = accessToken;

            storage.storeToken(id, token, function (result) {
              if (result.hasOwnProperty("success") && result.success) {
                console.log('github token stored ' + JSON.stringify(id));
                console.log('github user returned  ' + JSON.stringify(token));
                return done(null, token);
              } else {
                console.log('cannot store token ' + JSON.stringify(result));
                return done(null, false, {
                  message: result.error
                });

              }
            });
          }
        ));
        console.log('finished registering passport github strategy');

      } catch (e) {
        console.log('FAIL TO register a strategy');
        console.error("ERROR: error loading passport strategy: " + e);
      }
    }
  }, function (error) {
    console.log('cannot load database error' + JSON.stringify(error));
  });
}
module.exports = loadStrategy;

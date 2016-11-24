var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var fs = require('fs');
var dateUtils = require('../../util/date');
var tokens = require('../../util/tokens');
var connectionPoolPromisse = require('../../db/level/token-connection-pool');
var console = require('../../log');
var createError = require('http-errors');

function loadStrategy(conf) {
  if (!conf.auth.google) {
    console.log('there is no auth.google property in the config. Ignoring Google authentication');
  } else {
    connectionPoolPromisse(conf).then(function (storage) {
      try {
        passport.use(new GoogleStrategy({
            clientID: conf.auth.google.clientID,
            clientSecret: conf.auth.google.clientSecret,
            callbackURL: conf.auth.google["redirect_path"],
            scope: conf.auth.google.scope,
            passReqToCallback: false
          },
          function ( /*request,*/ accessToken, refreshToken, tokenObject, profile, done) {
            var id = {
              user_name: profile.email,
              auth_type: profile.provider
            };
            //storage.getTokenByUser(id, function (result) {
            //  if (result.success)
            //    console.log("there was a token from  google already" + JSON.stringify(result.data));
            //  });
            var token = {};
            token.user_name = profile.email;
            token.auth_type = profile.provider;
            var exp = 1200;
            if (tokenObject.hasOwnProperty("expires_in"))
              exp = (tokenObject["expires_in"]);

            token.expiration = dateUtils.sqliteDateNowPlusSeconds(exp);
            token.scope = conf.auth.google.scope;
            token.token_type = "bearer";
            token.token = tokenObject.access_token;
            if (refreshToken)
              token.refresh_token = refreshToken;

            storage.storeToken(id, token, function (result) {
              if (result.hasOwnProperty("success") && result.success) {
                console.log(auth_type + ' token stored for ' + JSON.stringify(id));
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
        console.log('finished registering passport google strategy')
      } catch (e) {
        console.log('FAIL TO register a strategy');
        console.error("ERROR: error loading passport strategy: " + e);
      }

    }, function (error) {
      throw createError(500, 'cannot load database error' + JSON.stringify(error));
    });
  }
}
module.exports = loadStrategy;

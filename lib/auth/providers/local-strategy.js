var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var fs = require('fs');
var dateUtils = require('../../util/date');
var connectionPoolPromisse = require('../token-connection-pool');
var tokens = require('../../util/token-generator');
var console = require('../../log');
var createError = require('http-errors');
var user = null;
var pam = null;

function loadStrategy(conf) {

  //attempt to load pam... if not use fallback user...
  try {
    require.resolve('authenticate-pam');
    pam = require('authenticate-pam');
    console.log('agile-local strategy configured as PAM');

  } catch (e) {

    if (conf.hasOwnProperty("auth") && conf.auth.hasOwnProperty("local") && conf.auth.local.hasOwnProperty("fallback-user-no-pam")) {
      user = conf.auth.local['fallback-user-no-pam'];
    } else {
      console.log('agile-local strategy neither configured as PAM nor to use  local users');
      console.log("there is no auth.local.fallback-user-no-pam property in the config. Ignoring local authentication based on local users");
    }
    console.log("Running without PAM authentication... using default file in ");

  }

  function setToken(storage, username, auth_type, done) {
    var cookie_id = tokens.generateCookie();
    var id = {
      user_name: user.username,
      auth_type: auth_type
    };
    var accessToken = tokens.generateToken();
    var token = {};
    token.token = accessToken;
    token.scope = [conf.gateway_id];
    token.token_type = "agile_unix_pam";
    token.auth_type = auth_type;
    token.user_name = username;

    storage.storeToken(id, token, function (result) {
      if (result.hasOwnProperty("success") && result.success) {
        console.log(auth_type + ' token stored for ' + id);
        return done(null, token);
      } else {
        console.log('cannot store token ' + JSON.stringify(result));
        return done(null, false, {
          message: result.error
        });

      }
    });
  }

  connectionPoolPromisse(conf).then(function (storage) {
    try {
      //https://github.com/jaredhanson/passport/issues/50 To avoid confusions with other local strategies we name it :)
      passport.use('agile-local', new LocalStrategy(
        function (username, password, done) {
          if (!username || !password) {
            return done(null, false);
          } else if (pam) {
            pam.authenticate(username, password, function (err) {
              if (err) return done(err);
              else setToken(storage, username, "unix_pam", done);
            });
          } else {
            if (password === user.password && username === user.username) {
              setToken(storage, username, "fallback_user_no_pam", done);
            } else {
              return done(null, false);
            }
          }

        }
      ));
      console.log('finished registering passport agile-local strategy');
    } catch (e) {
      console.log('FAIL TO register a strategy');
      console.error("ERROR: error loading passport strategy: " + e);
    }

  }, function (error) {
    throw createError(500, 'cannot load database error' + JSON.stringify(error));
  });
}
module.exports = loadStrategy;

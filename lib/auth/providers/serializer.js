var passport = require('passport');
var connectionPoolPromisse = require('../token-connection-pool');
var createError = require('http-errors');
var console = require('../../log');

function loadStrategy(conf) {

  connectionPoolPromisse(conf).then(function (storage) {
    passport.serializeUser(function (user, done) {
      console.log('serializeUser: ' + JSON.stringify(user));
      done(null, JSON.stringify({
        user_name: user.user_name,
        auth_type: user.auth_type
      }));
    });
    passport.deserializeUser(function (id, done) {
      storage.getTokenByUser(JSON.parse(id), function (result) {
        console.log("searching for user with id " + id);
        if (result.hasOwnProperty("success") && result.success) {
          console.log("result from deserialize data" + JSON.stringify(result));
          done(null, result.data);

        } else done(result.error, null);
      });
    });
    console.log('finished setting up passport seralizer');
  }, function (error) {
    throw createError('cannot load database error' + error);
  })
}
module.exports = loadStrategy;

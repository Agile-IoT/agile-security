var passport = require('passport');
var connectionPoolPromisse = require('../token-connection-pool');

function loadStrategy(conf) {

  connectionPoolPromisse(conf).then(function (storage) {
    passport.serializeUser(function (user, done) {
      console.log('serializeUser: ' + JSON.stringify(user));
      done(null, user["user_id"]);
    });
    passport.deserializeUser(function (id, done) {
      storage.getTokenByUserId(id, function (result) {
        if (result.hasOwnProperty("success") && result.success) {
          console.log("result from deserialize data" + JSON.stringify(result.data));
          done(null, result.data);

        } else done(err, null);
      });
    });
    console.log('finished setting up passport seralizer');
  }, function (error) {
    console.log('cannot load database error' + JSON.stringify(error));
  })
}
module.exports = loadStrategy;

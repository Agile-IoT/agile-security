var passport = require('passport');
var BearerStrategy = require('passport-http-bearer').Strategy;
var connectionPoolPromisse = require('../token-connection-pool');

function loadStrategy(conf) {

  connectionPoolPromisse(conf).then(function (storage) {
    try {
      passport.use("agile-oauth2-token", new BearerStrategy(
        function (token, done) {
          storage.getTokenByToken(token, function (result) {
            if (result.hasOwnProperty("success") && result.success) {
              return done(null, result.data);
            } else {
              console.log('cannot find token info: result' + JSON.stringify(result) + ' token provided for the search ' + token);
              return done(null, false, {
                message: result.error
              });
            }

          });
        }
      ));
      console.log('finished registering passport bearer strategy');

    } catch (e) {
      console.log('FAIL TO register a strategy');
      console.error("ERROR: error loading passport strategy: " + e);
    }
  }, function (error) {
    console.log('cannot load database error' + JSON.stringify(error));
  })
}
module.exports = loadStrategy;

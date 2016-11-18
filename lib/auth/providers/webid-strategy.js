var passport = require('passport');
var WebIDStrategy = require('passport-webid').Strategy;
var dateUtils = require('../../util/date');
var tokens = require('../../util/token-generator');
var connectionPoolPromisse = require('../token-connection-pool');
var console = require('../../log');
var createError = require('http-errors');

function loadStrategy(conf) {
  if (!conf.auth["web-id"]) {
    console.log('there is no auth.web-id property in the config. Ignoring Web-ID authentication');
  } else {
    connectionPoolPromisse(conf).then(function (storage) {
      try {
        passport.use(new WebIDStrategy( /*{ failureRedirect: '/fail', failureFlash: true },*/
          function (webid, certificate, req, done) {
            var auth_type = "webid";
            var token = {};
            var id = {
              user_name: webid,
              auth_type: auth_type
            };
            //storage.getTokenByUser(id, function (result) {
            //  if (result.success)
            //    console.log("there was a token from  webid already" + JSON.stringify(result.data));
            //  });
            //console.log(JSON.stringify(profile));

                //console.log(JSON.stringify(profile));
                var accessToken = tokens.generateToken();
                token.user_name = webid;
                //TODO fix date ... it doesn't expire
                var d = Date.parse(certificate.valid_to);
                token.expiration = dateUtils.dateToSqlite(d);
                token.scope = ["web_id"];
                token.token_type = "agile-web_id";
                token.auth_type = auth_type;
                token.token = accessToken;

                storage.storeToken(id, token, function (result) {
                  if (result.hasOwnProperty("success") && result.success) {
                    console.log('webid token stored '  + JSON.stringify(id));
                    console.log('webid user returned  ' + JSON.stringify(token));
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
        console.log('finished registering passport webid strategy');

      } catch (e) {
        console.log('FAIL TO register a strategy');
        console.error("ERROR: error loading passport strategy: " + e);
      }
    }, function (error) {
      console.log('cannot load database error' + JSON.stringify(error));
    });
  }
}

module.exports = loadStrategy;

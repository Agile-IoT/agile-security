var passport = require('passport');
var WebIDStrategy = require('passport-webid').Strategy;
var dateUtils = require('../../util/date');
var tokens = require('../../util/token-generator');
var connectionPoolPromisse = require('../token-connection-pool');

function loadStrategy(conf) {

  connectionPoolPromisse(conf).then(function (storage) {
    //strategy :)
    try {

      passport.use(new WebIDStrategy( /*{ failureRedirect: '/fail', failureFlash: true },*/
        function (webid, certificate, req, done) {

          storage.getTokenByUserId(webid, function (result) {
            if (result.success) {
              console.log("result from deserialize data" + JSON.stringify(result.data));
              done(null, result.data);
            } else {
              //console.log(JSON.stringify(profile));
              var cookie_id = tokens.generateCookie();
              var id = tokens.generateId();
              var accessToken = tokens.generateToken();

              token = {};
              token["user_id"] = webid;
              //TODO fix date ... it doesn't expire
              var d = Date.parse(certificate.valid_to);
              token["expiration"] = dateUtils.dateToSqlite(d);
              token["scope"] = JSON.stringify(["web_id"]);
              token["token_type"] = "webid";
              token["auth_type"] = "webid";
              token['token'] = accessToken;

              //console.log('cookie '+cookie_id)
              //console.log('id '+id)
              storage.storeToken(id, cookie_id, token["auth_type"], token, function (result) {
                if (result.hasOwnProperty("success") && result.success) {
                  console.log('webid token stored ' + id)
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
  })
}

module.exports = loadStrategy;

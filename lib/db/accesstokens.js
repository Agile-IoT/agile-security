var createError = require('http-errors');
var connectionPoolPromisse = require('./level/token-connection-pool');

var find = function (conf, key, done) {
  connectionPoolPromisse(conf).then(function (storage) {
    storage.getTokenByToken(key, function (result) {
      if (result.hasOwnProperty("success") && result.success) {
        console.log('token info found: result' + JSON.stringify(result.data));
        return done(null, result.data);
      } else {
        console.log('cannot find token info: result' + JSON.stringify(result) + ' token provided for the search ' + key);
        return done(null, false, {
          message: result.error
        });
      }

    });
  }, function (error) {
    throw createError(500, 'cannot load database error' + JSON.stringify(error));
  });
};

var save = function (conf, tok, userID, clientID, token_type, auth_type, scope, expiration, done) {
  connectionPoolPromisse(conf).then(function (storage) {
    try {
      var token = {};
      token.userID = userID; //used to find users in the example db
      token.clientId = clientID;
      token.expiration = expiration;
      token.scope = scope;
      token.token_type = token_type;
      token.auth_type = auth_type;
      token.token = tok;
      var id = {
        user_name: userID,
        auth_type: "oauth2_test"
      }

      storage.storeToken(id, token, function (result) {
        if (result.hasOwnProperty("success") && result.success) {
          console.log(' token stored for ' + JSON.stringify(id));
          return done(null, token);
        } else {
          console.log('cannot store token for id ' + JSON.stringify(id) + "result " + JSON.stringify(result) + result.error);
          return done(null, false, {
            message: result.error
          });
        }
      });

      console.log('finished registering passport google strategy')
    } catch (e) {
      console.log('FAIL TO register a strategy');
      console.error("ERROR: error loading passport strategy: " + e);
    }

  }, function (error) {
    throw createError(500, 'cannot load database error' + JSON.stringify(error));
  });

};

module.exports = function (conf) {
  return {
    find: find.bind(this, conf),
    save: save.bind(this, conf)
  }
};

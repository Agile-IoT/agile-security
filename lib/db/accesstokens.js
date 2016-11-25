var createError = require('http-errors');
var connectionPoolPromisse = require('./level/token-connection-pool');
var ids = require('../util/id');
var console = require('../log');

var find = function (conf, key, done) {
  connectionPoolPromisse(conf).then(function (storage) {
    storage.getTokenByToken(key, function (result) {
      if (result.hasOwnProperty("success") && result.success) {
        var token = result.data;
        console.log('token info found by id. for user id ' + token.userID +
          ' and for client id ' + token.clientId +
          ' and with expiration ' + token.expiration +
          ' and scope ' + JSON.stringify(token.scope));

        return done(null, token);
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

var findByUsernameAndAuthType = function (conf, username, auth_type, done) {
  connectionPoolPromisse(conf).then(function (storage) {
    var id = {
      user_name: username,
      auth_type: auth_type
    };
    storage.getTokenByUser(id, function (result) {
      if (result.hasOwnProperty("success") && result.success) {
        var token = result.data;
        console.log('token info found by user.  user id ' + token.userID +
          ' and for client id' + token.clientId +
          ' and with expiration ' + token.expiration +
          ' and scope ' + JSON.stringify(token.scope));
        return done(null, token);
      } else {
        console.log('cannot find token info: result' + JSON.stringify(result) + ' user id  provided for the search ' + JSON.stringify(id));
        return done(null, false, {
          message: result.error
        });
      }

    });
  }, function (error) {
    throw createError(500, 'cannot load database error' + JSON.stringify(error));
  });
};

var save = function (conf, tok, userID, clientID, token_type, scope, expiration, refreshToken, done) {
  connectionPoolPromisse(conf).then(function (storage) {
    try {
      var token = {};
      var auth_type = ids.getAuthType(userID);
      token.userID = userID; //used to find users in the example db
      token.clientId = clientID;
      token.expiration = expiration;
      token.scope = scope;
      token.token_type = token_type;
      token.auth_type = auth_type;
      token.token = tok;
      token.refreshToken = refreshToken;

      var id = {
        user_name: ids.getUsername(userID),
        auth_type: auth_type
      };

      storage.storeToken(id, token, function (result) {
        if (result.hasOwnProperty("success") && result.success) {
          console.log('token info stored for user.  user id ' + token.userID +
            ' and for client id' + token.clientId +
            ' and with expiration ' + token.expiration +
            ' and refresh token ' + token.refreshToken +
            ' and scope ' + JSON.stringify(token.scope));
          return done(null, token);
        } else {
          console.log('cannot store token for id ' + JSON.stringify(id) + "result " + JSON.stringify(result) + result.error);
          return done(null, false, {
            message: result.error
          });
        }
      });

    } catch (e) {
      console.log('fail to store token ' + e);
    }

  }, function (error) {
    throw createError(500, 'cannot load database error' + JSON.stringify(error));
  });

};

module.exports = function (conf) {
  return {
    find: find.bind(this, conf),
    findByUsernameAndAuthType: findByUsernameAndAuthType.bind(this, conf),
    save: save.bind(this, conf)

  };
};

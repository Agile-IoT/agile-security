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

var findByUsernameAndAuthTypeAndClient = function (isClient, conf, username, auth_type, client_id, done) {
  connectionPoolPromisse(conf).then(function (storage) {
    storage.findByUserIDAndClient(ids.buildId(username, auth_type), client_id, isClient, function (result) {
      if (result.hasOwnProperty("success") && result.success) {
        var token = result.data;
        console.log('token info found by user.  user id ' + token.userID +
          ' and for client id' + token.clientId +
          ' and with expiration ' + token.expiration +
          ' and scope ' + JSON.stringify(token.scope));
        return done(null, token);
      } else {
        console.log('cannot find token info: result' + JSON.stringify(result) + ' user username  provided for the search ' + username + " auth_type " + auth_type + " and client " + client_id);
        return done(null, false, {
          message: result.error
        });
      }

    });
  }, function (error) {
    throw createError(500, 'cannot load database error' + JSON.stringify(error));
  });
};

function internalSave(storage, id, token, done) {
  try {
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
    return done(null, false, {
      message: "fail to store token " + e
    });
  }
}

var save = function (isClient, conf, tok, userID, clientID, token_type, scope, expiration, refreshToken, done) {
  connectionPoolPromisse(conf).then(function (storage) {
      var token = {};
      token.userID = userID; //used to find users in the example db
      token.clientId = clientID;
      token.expiration = expiration;
      token.scope = scope;
      token.token_type = token_type;
      token.auth_type = ids.getAuthType(userID);
      token.token = tok;
      token.refreshToken = refreshToken;

      var id = {
        user_name: ids.getUsername(token.userID),
        auth_type: ids.getAuthType(token.userID),
        isClient: isClient
        //time: (new Date()).getTime() //this is needed to ensure that we can handle more than one token per client and user (two sessions in different browsers for example)
      };
      internalSave(storage, id, token, done);
    },
    function (error) {
      throw createError(500, 'cannot load database error' + JSON.stringify(error));
    });

};

module.exports = function (conf) {
  return {
    find: find.bind(this, conf),
    findByUsernameAndAuthTypeAndClient: findByUsernameAndAuthTypeAndClient.bind(this, false, conf),
    findClientTokenByUsernameAndAuthTypeAndClient: findByUsernameAndAuthTypeAndClient.bind(this, true, conf),
    save: save.bind(this, false, conf),
    saveClientToken: save.bind(this, true, conf)

  };
};

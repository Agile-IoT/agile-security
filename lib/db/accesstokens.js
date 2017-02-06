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
var saveOauth2Token = function (conf, tok, userID, clientID, token_type, scope, expiration, refreshToken, oauth2_flow, done) {
  console.log("parameters to store Oauth2 token " + JSON.stringify(arguments, null, 2));
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
        oauth2: oauth2_flow,
        client_id: clientID
      };
      internalSave(storage, id, token, done);
    },
    function (error) {
      throw createError(500, 'cannot load database error' + JSON.stringify(error));
    });

};

var deleteOauth2TokenWithNullClients = function (conf, username, auth_type, oauth2_flow, done) {
  connectionPoolPromisse(conf).then(function (storage) {
      var id = {
        user_name: username,
        auth_type: auth_type,
        oauth2: oauth2_flow,
        client_id: null
        //time: (new Date()).getTime() //this is needed to ensure that we can handle more than one token per client and user (two sessions in different browsers for example)
      };
      storage.deleteTokensById(id, function (result) {
        if (result.hasOwnProperty("success") && result.success) {
          var token = result.data;
          console.log('token info deleted by id. for token id ' + JSON.stringify(id));
          return done(null, null);
        } else {
          console.log('cannot delete token info: result' + JSON.stringify(result) + ' id provided for the search ' + JSON.stringify(id));
          return done(null, createError(500, result.error));
        }

      });
    },
    function (error) {
      throw createError(500, 'cannot load database error' + JSON.stringify(error));
    });
};

var findOauth2Token = function (conf, username, auth_type, clientID, oauth2_flow, done) {
  connectionPoolPromisse(conf).then(function (storage) {
      var id = {
        user_name: username,
        auth_type: auth_type,
        oauth2: oauth2_flow,
        client_id: clientID
        //time: (new Date()).getTime() //this is needed to ensure that we can handle more than one token per client and user (two sessions in different browsers for example)
      };
      storage.getTokenById(id, function (result) {
        if (result.hasOwnProperty("success") && result.success) {
          var token = result.data;
          console.log('token info found by id. for token id ' + JSON.stringify(id));
          return done(null, token);
        } else {
          if (result.hasOwnProperty("error") && result.error.statusCode === 404) {
            console.log("token with id " + JSON.stringify(id) + " not found ");
            return done(null, null);
          } else {
            console.log('cannot find token info: result' + JSON.stringify(result) + ' id provided for the search ' + JSON.stringify(id));
            return done(null, createError(500, result.error));
          }

        }

      });
    },
    function (error) {
      throw createError(500, 'cannot load database error' + JSON.stringify(error));
    });
};

var save = function (conf, tok, userID, clientID, token_type, scope, expiration, refreshToken, done) {
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
        oauth2: null,
        client_id: clientID
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
    find: find.bind(this, conf), //find by token
    save: save.bind(this, conf), // save used from all the providers. They still don't know the oauth2 flow type nor the client id
    saveOauth2Token: saveOauth2Token.bind(this, conf),
    findOauth2Token: findOauth2Token.bind(this, conf),
    deleteOauth2TokenWithNullClients: deleteOauth2TokenWithNullClients.bind(this, conf)
    //findByUsernameAndAuthTypeAndClient: findByUsernameAndAuthTypeAndClient.bind(this, false, conf),
    //findClientTokenByUsernameAndAuthTypeAndClient: findByUsernameAndAuthTypeAndClient.bind(this, true, conf),

    //saveClientToken: save.bind(this, conf, true)

  };
};

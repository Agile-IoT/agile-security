var createError = require('http-errors');
var connectionPoolPromisse = require('./level/token-connection-pool').loadDb;
var ids = require('../util/id');
var console = require('../log');

var find = function (conf, key, done) {
  connectionPoolPromisse(conf).then(function (storage) {
    storage.getTokenByToken(key, function (result) {
      if (result.hasOwnProperty("success") && result.success) {
        var token = result.data;
        console.log('token info found by. for user id ' + token.userID +
          ' and for client id ' + token.clientId +
          ' and with expiration ' + token.expiration +
          ' and scope ' + JSON.stringify(token.scope));
        return done(null, token);

      } else {
        if (result.hasOwnProperty("error") && result.error.statusCode === 404) {
          console.log('cannot find token info: result' + JSON.stringify(result) + ' token provided for the search ' + key);
          return done(null, null);
        } else {
          console.log('cannot find token info: result' + JSON.stringify(result) + ' token provided for the search ' + key);
          return done(null, null);
        }
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
        return done(null, null);
      }
    });

  } catch (e) {
    console.log('fail to store token ' + e);
    return done(null, null);
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
      token.user_name = ids.getUsername(token.userID);
      token.oauth2 = oauth2_flow;
      internalSave(storage, tok, token, done);
    },
    function (error) {
      throw createError(500, 'cannot load database error' + JSON.stringify(error));
    });

};

var logOut = function (conf, token, done) {
  connectionPoolPromisse(conf).then(function (storage) {
      storage.deleteTokenByToken(token, function (result) {
        return done(null, null);
      });
    },
    function (error) {
      throw createError(500, 'cannot load database error' + JSON.stringify(error));
    });
};

var findOauth2Token = function (conf, username, auth_type, clientID, oauth2_flow, done) {
  connectionPoolPromisse(conf).then(function (storage) {
      storage.findByUserAndClientAndOauth2Type(username, auth_type, clientID, oauth2_flow, function (result) {
        var args = arguments;
        if (result.hasOwnProperty("success") && result.success) {
          var token = result.data;
          console.log('found valid token info found by id. for  user ' + username + " auth " + auth_type + " client " + clientID + " oauth " + oauth2_flow);
          return done(null, token);
        } else {
          if (result.hasOwnProperty("error") && result.error.statusCode === 404) {
            console.log("findOauth2Token: oauth2 token for arguments " + JSON.stringify(args) + " not found ");
            return done(null, null);
          } else {
            console.log('cannot find token info: result' + JSON.stringify(result) + ' arguments provided for the findOauth2Token search ' + JSON.stringify(args));
            return done(null, null);
          }

        }

      });
    },
    function (error) {
      throw createError(500, 'cannot load database error' + JSON.stringify(error));
    });
};

module.exports = function (conf) {
  return {
    //find retrieves a token object by its token
    find: find.bind(this, conf), //find by token
    saveOauth2Token: saveOauth2Token.bind(this, conf),
    findOauth2Token: findOauth2Token.bind(this, conf),
    //removes the token from the database
    logOut: logOut.bind(this, conf)
    //findByUsernameAndAuthTypeAndClient: findByUsernameAndAuthTypeAndClient.bind(this, false, conf),
    //findClientTokenByUsernameAndAuthTypeAndClient: findByUsernameAndAuthTypeAndClient.bind(this, true, conf),

    //saveClientToken: save.bind(this, conf, true)

  };
};

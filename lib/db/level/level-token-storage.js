var createError = require('http-errors');
var console = require('../../log.js');
var level = require('level');
var transaction = require('level-transactions');

var TokenStorage = function () {

};

//initialize
TokenStorage.prototype.init = function (conf, onInitFinished) {
  var that = this;
  var filename = conf.dbName;
  //onInitFinished({"success":true});
  var options = {
    keyEncoding: 'json',
    valueEncoding: 'json'
  };
  that.tokens = level(filename + "_tokens", options, function (err, db) {
    if (err) throw createError(500, "unexpected error" + err);
    else
      onInitFinished({
        "success": true
      });
  });

};

//returns an object with success field with true or false. when success == false then the returned object also has an error message.
//token needs at least the following attributes: 'token', "scope", "token_type", "auth_type","user_id"
// then additional parameters in the token argument are: "expiration"
TokenStorage.prototype.storeToken = function (token_id, token, onStorageTokenFinished) {
  console.log("arguments for storeToken " + JSON.stringify(arguments));
  var that = this;
  //token.token && token.scope && token.token_type && token.user_name && token.auth_type && token.expiration
  if (token.token && token.scope && token.token_type && token.auth_type) {
    console.log('putting token ');
    that.tokens.put(token_id, token, function (error) {
      console.log('result of put: error ' + error);
      if (error)
        onStorageTokenFinished({
          success: false,
          error: createError(500, "unexpected error while storing token with id " + token_id + " and value " + JSON.stringify(token) + error)
        });
      else
        onStorageTokenFinished({
          success: true
        });

    });
  } else {
    onStorageTokenFinished({
      success: false,
      error: createError(500, "unexpected format for token")
    });
  }
  // token['token'], token["scope"], token["token_type"], token["auth_type"],token["user_id"], token["expiration"], token["refresh_token"]
};

function getTokenById(id, callback) {
  var that = this;
  that.tokens.get(id, function (error, value) {
    if (error)

      callback({
        success: false,
        error: error.type === 'NotFoundError' ? createError(404, "id not found " + JSON.stringify(id) + error) : createError(500, "unexpected error while retrieving token with id " + JSON.stringify(id) + error)
      });
    else
      callback({
        "success": true,
        "data": value
      });
  });
}

TokenStorage.prototype.getTokenByToken = getTokenById;

function deleteTokensById(id, callback) {
  var that = this;
  that.tokens.del(id, function (error, value) {
    if (error)
      callback({
        success: false,
        error: createError(500, "unexpected error while deleting token with id " + JSON.stringify(id) + error)
      });
    else
      callback({
        "success": true
      });
  });
}

TokenStorage.prototype.deleteTokenByToken = deleteTokensById;

TokenStorage.prototype.findByUserAndClientAndOauth2Type = function (username, auth_type, client_id, oauth2_flow, callback) {
  console.log(" arguments for findByUsernameAndAuthType  in token storage : username " + username + " and auth type " + auth_type + " and client id " + client_id + " and oauth2: " + oauth2_flow);
  var array = [];
  var that = this;
  that.tokens.createReadStream()
    .on('data', function (data) {
      console.log('processing token info ' + JSON.stringify(data));
      console.log(" information being checked" + data.value.user_name + "," + data.value.clientId + "," + data.value.auth_type + "," + data.value.oauth2);
      if (data.value.user_name === username && data.value.clientId === client_id && data.value.auth_type === auth_type && data.value.oauth2 === oauth2_flow)
        array.push(data.value);
    })
    .on('error', function (err) {
      callback({
        success: false,
        error: createError(500, "unexpected error while reading stream" + err)
      });
    })
    .on('end', function () {
      if (array.length === 0)
        callback({
          success: false,
          error: createError(500, "no token object found for token  username " + username + " and auth type " + auth_type + " and client id " + client_id + " and oauth2: " + oauth2_flow)
        });
      else
        callback({
          success: true,
          data: array[0]
        });
    });
};

module.exports = TokenStorage;

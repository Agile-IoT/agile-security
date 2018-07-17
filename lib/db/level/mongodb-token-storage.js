var createError = require('http-errors');
var console = require('../../log.js');
var Promise = require('bluebird');
var mongoClient = Promise.promisifyAll(require('mongodb').MongoClient);


var TokenStorage = function () {

};

//initialize
TokenStorage.prototype.init = function (conf, onInitFinished) {
  var that = this;
  mongoClient.connect('mongodb://' + conf.user + ':' + conf.password + '@' + conf.host + '/' + conf.dbName).then(db => {
    that.db = db
    that.tokens = db.collection(conf.collection)
    that.tokens.createIndex({token: 1}, {unique: true}, (err) => {
      if (err) Promise.reject(err);
    })
  }).then(() => {
    onInitFinished({
      "success": true
    })
  }).catch(err => {
    throw createError(500, "unexpected error" + err);
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
    that.tokens.insert(token, function (error) {
      console.log('result of put: error ' + error);
      if (error)
        onStorageTokenFinished({
          success: false,
          error: error
        });
      else
        onStorageTokenFinished({
          success: true
        });

    })
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
  var t = new Date().getTime();

  that.tokens.findOne({token: id}, function (error, value) {
    console.log(value)
    if (error) {
      callback({
        success: false,
        error: error.type === 'NotFoundError' ? createError(404, "id not found " + JSON.stringify(id) + error) : createError(500, "unexpected error while retrieving token with id " + JSON.stringify(id) + error)
      });
    } else {
      if (value.expiration === null || value.expiration > t) {
        callback({
          "success": true,
          "data": value
        });
      } else {
        that.deleteTokenByToken(id, function (res) {
          console.log("token by id not found. it was expired " + JSON.stringify(id) + error);
          callback({
            success: false,
            error: createError(404, "token by id not found. it was expired " + JSON.stringify(id) + error)
          });
        });
      }
    }

  });
}

TokenStorage.prototype.getTokenByToken = getTokenById;

function deleteTokensById(id, callback) {
  var that = this;

  that.tokens.deleteOne({token: id}, function (error, value) {
    if (error)
      callback({
        success: false,
        error: error
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
  var that = this;
  var t = new Date().getTime();
  that.tokens.findOne({user_name: username, auth_type: auth_type, oauth2: oauth2_flow, clientId: client_id}, function (error, value) {
    console.log(value)
    if (error) {
      callback({
        success: false,
        error: error.type === 'NotFoundError' ? createError(404, "id not found " + JSON.stringify(id) + error) : createError(500, "unexpected error while retrieving token with id " + JSON.stringify(id) + error)
      });
    } else {
      if (value.expiration === null || value.expiration > t) {
        callback({
          "success": true,
          "data": value
        });
      } else {
        that.deleteTokenByToken(id, function (res) {
          console.log("token by id not found. it was expired " + JSON.stringify(id) + error);
          callback({
            success: false,
            error: createError(404, "token by id not found. it was expired " + JSON.stringify(id) + error)
          });
        });
      }
    }
  });
};

TokenStorage.prototype.closeDB = function() {
  if(this.db) {
    this.db.close()
  }
}

module.exports = TokenStorage;

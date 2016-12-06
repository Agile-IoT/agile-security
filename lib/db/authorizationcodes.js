var console = require('../log');
var createError = require('http-errors');

var codes = {};

exports.find = function (key, done) {
  if (codes.hasOwnProperty(key)) {
    var code = codes[key];
    console.log("retriveing auth code: user id" + code.userID +
      "clientId" + code.clientID +
      "redirectURI" + code.redirectURI +
      "authType" + code.authType
    );
    return done(null, code);
  } else {
    return done(createError(403, "invalid authorization code"), null);
  }

};

exports.save = function (code, clientID, redirectURI, userID, authType, done) {
  console.log("storing auth code " + code + " for user id " + userID +
    "clientID " + clientID +
    "clientID " + redirectURI
  );
  codes[code] = {
    clientID: clientID,
    redirectURI: redirectURI,
    userID: userID,
    authType: authType,
  };
  return done(null);
};

exports.delete = function (code, done) {
  console.log("removing auth code: " + code);
  delete codes[code];
  console.log('new codes: ' + JSON.stringify(codes));
  return done(null);
};

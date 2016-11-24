var codes = {};

exports.find = function (key, done) {
  console.log("////////////////////////////////////// retriveing auth code: " + JSON.stringify(codes[key]));
  var code = codes[key];
  return done(null, code);
};

exports.save = function (code, clientID, redirectURI, userID, authType, token, done) {
  console.log("////////////////////////////////////// storing auth code: " + JSON.stringify({
    clientID: clientID,
    redirectURI: redirectURI,
    userID: userID
  } + " actual code - " + code));
  // TODO remove authcodes after they have been exchanged!
  codes[code] = {
    clientID: clientID,
    redirectURI: redirectURI,
    userID: userID,
    authType: authType,
    token: token
  };
  return done(null);
};

exports.delete = function (code, done) {
  console.log("////////////////////////////////////// removing auth code: " + code);
  // TODO remove authcodes after they have been exchanged!
  delete codes[code];
  console.log('new codes: ' + JSON.stringify(codes));
  return done(null);
};

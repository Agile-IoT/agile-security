var passport = require('passport');
var createError = require('http-errors');
var console = require('../log');

function loadStrategy(tokenconf, entityStorageConf) {

  var db = require('../db')(tokenconf, entityStorageConf);

  /*these are the user serializers:
  They are invoked any time a user logs in (regardles of the method used to authenticate the user (Google, Github, etc))
  However, AGILE_IDM also works as an Oauth2 server. For this, The CLIENT must be serialized, see below.
  */
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    db.users.find(id, function (err, user) {
      done(err, user);
    });
  });

  //we load first the oauth2orize server
  var server = require('./oauth2/oauth2orize')(tokenconf, entityStorageConf);

  // Register serialialization and deserialization functions.
  //
  // When a client redirects a user to user authorization endpoint, an
  // authorization transaction is initiated.  To complete the transaction, the
  // user must authenticate and approve the authorization request.  Because this
  // may involve multiple HTTP request/response exchanges, the transaction is
  // stored in the session.
  //
  // An application must supply serialization functions, which determine how the
  // client object is serialized into the session.  Typically this will be a
  // simple matter of serializing the client's ID, and deserializing by finding
  // the client by ID from the database.

  server.serializeClient(function (client, done) {
    console.log('serializing client ' + JSON.stringify(client));
    return done(null, client.id);
  });

  server.deserializeClient(function (id, done) {

    db.clients.find(id, function (err, client) {
      if (err) {
        return done(err);
      }
      console.log('deserializing client by id ' + JSON.stringify(client));
      return done(null, client);
    });
  });

}
module.exports = loadStrategy;

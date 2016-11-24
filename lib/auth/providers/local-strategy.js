var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var fs = require('fs');
var dateUtils = require('../../util/date');
var tokens = require('../../util/tokens');
var console = require('../../log');
var createError = require('http-errors');

function loadStrategy(tokenconf, entityStorageConf) {
  var db = require('../../db')(tokenconf, entityStorageConf);

  //Authenticates users from the entity database by password.
  passport.use("agile-local", new LocalStrategy(
    function (username, password, done) {
      var auth_type = "local";
      db.users.findByUsernameAndAuthType(username, auth_type, function (err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false);
        }
        if (user.password != password) {
          return done(null, false);
        }
        return done(null, user);
      });
    }
  ));
}
module.exports = loadStrategy;

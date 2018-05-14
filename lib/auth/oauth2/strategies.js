/*
MIT License

Copyright (c) 2016 Gerges Beshay

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Modifications 2016 David Parra. removed some unused parts, enhanced scopes and
add error handling. However, the coments explaining  each oauth2 server
endpoint are kept.
*/
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var PasswordGrantStrategy = require('passport-oauth2-password-grant').Strategy;
var LocalStrategy = require('passport-local').Strategy;
//var console = require('../../log');

var auth = function (tokenconf, entityStorageConf) {
  var db = require('../../db')(tokenconf, entityStorageConf);

  /**
   * BasicStrategy & ClientPasswordStrategy
   *
   * These strategies are used to authenticate registered OAuth clients.  They are
   * employed to protect the `token` endpoint, which consumers use to obtain
   * access tokens.  The OAuth 2.0 specification suggests that clients use the
   * HTTP Basic scheme to authenticate.  Use of the client password strategy
   * allows clients to send the same credentials in the request body (as opposed
   * to the `Authorization` header).  While this approach is not recommended by
   * the specification, in practice it is quite common.
   */
  try {
    passport.use("oauth2-basic", new BasicStrategy(
      function (username, password, done) {
        console.log("Executing Basic strategy with username " + username);
        db.clients.findByClientId(username, function (err, client) {
          if (err) {
            return done(err);
          }
          if (!client) {
            return done(null, false);
          }
          if (client.clientSecret !== password) {
            return done(null, false);
          }
          return done(null, client);
        });
      }
    ));
  } catch (e) {
    console.log('FAIL TO register a strategy');
    console.error("ERROR: error loading  oauth2-basic (server) strategy: " + e);
  }

  try {
    passport.use("oauth2-client-password", new ClientPasswordStrategy(
      function (clientId, clientSecret, done) {
        console.log("Executing Client Password strategy with  clientId " + clientId);
        db.clients.findByClientId(clientId, function (err, client) {
          if (err) {
            return done(err);
          }
          if (!client) {
            return done(null, false);
          }
          if (client.clientSecret !== clientSecret) {
            return done(null, false);
          }
          return done(null, client);
        });
      }
    ));
  } catch (e) {
    console.log('FAIL TO register a strategy');
    console.error("ERROR: error loading oauth2-client-password (server) strategy: " + e);
  }

  try {
    passport.use("oauth2-password-grant", new LocalStrategy(
      function (username, password, done) {
        console.log("Executing user Password strategy with  userid " + username);
        db.users.findByUsernameAndAuthType(username, 'agile-local', function (err, user) {
          console.log(user)
          if (err) {
            return done(err);
          }
          if (!user) {
            return done(null, false);
          }
          if (user.password !== password) {
            return done(null, false);
          }
          return done(null, user);
        });
      }
    ));
  } catch (e) {
    console.log('FAIL TO register a strategy');
    console.error("ERROR: error loading oauth2-client-password (server) strategy: " + e);
  }


  /**
   * BearerStrategy
   *
   * This strategy is used to authenticate either users or clients based on an access token
   * (aka a bearer token).  If a user, they must have previously authorized a client
   * application, which is issued an access token to make requests on behalf of
   * the authorizing user.
   */
  try {
    passport.use("agile-bearer", new BearerStrategy(
      function (accessToken, done) {
        db.accessTokens.find(accessToken, function (err, token) {
          if (err) {
            return done(err);
          }
          if (!token) {
            return done(null, false);
          }
          if (token.userID !== null) {
            db.users.find(token.userID, function (err, user) {
              if (err) {
                return done(err);
              }
              if (!user) {
                return done(null, false);
              }
              //TODO extend later with more info for the user
              var info = {
                scope: token.scope,
                clientId: token.clientId,
                auth_type: token.auth_type,
                expiration: token.expiration
              };
              done(null, user, info);
            });
          } else {
            done(null, false);
            /* part of the initial example, but for now we don't support this
            //The request came from a client only since userID is null
            //therefore the client is passed back instead of a user
            db.clients.findByClientId(token.clientID, function(err, client) {
               if(err) { return done(err); }
                if(!client) { return done(null, false); }
                // to keep this example simple, restricted scopes are not implemented,
                // and this is just for illustrative purposes
                var info = { scope: '*' }
                done(null, client, info);
            });*/
          }
        });
      }
    ));
  } catch (e) {
    console.log('FAIL TO register a strategy');
    console.error("ERROR: error loading bearer (server) strategy: " + e);
  }

  /*
    This strategy is only used when the internal functionality needs the token!!
    Don't use it unless you really need this. So far, this is only required to logout, i,e, delete the token.


  */
  try {
    passport.use("internal-agile-return-token-bearer", new BearerStrategy(
      function (accessToken, done) {
        db.accessTokens.find(accessToken, function (err, token) {
          if (err) {
            return done(err);
          }
          if (!token) {
            return done(null, false);
          }
          if (token.userID !== null) {
            db.users.find(token.userID, function (err, user) {
              if (err) {
                return done(err);
              }
              if (!user) {
                return done(null, false);
              }
              //TODO extend later with more info for the user
              var info = {
                scope: token.scope,
                clientId: token.clientId,
                auth_type: token.auth_type,
                token: token.token
              };
              done(null, user, info);
            });
          } else {
            done(null, false);
            /* part of the initial example, but for now we don't support this
            //The request came from a client only since userID is null
            //therefore the client is passed back instead of a user
            db.clients.findByClientId(token.clientID, function(err, client) {
               if(err) { return done(err); }
                if(!client) { return done(null, false); }
                // to keep this example simple, restricted scopes are not implemented,
                // and this is just for illustrative purposes
                var info = { scope: '*' }
                done(null, client, info);
            });*/
          }
        });
      }
    ));
  } catch (e) {
    console.log('FAIL TO register a strategy');
    console.error("ERROR: error loading bearer (server) strategy: " + e);
  }
};

module.exports = auth;

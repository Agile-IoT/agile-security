/*
MIT License

Copyright (c) 2016 Gerges Beshay. nopbyte

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
*/

var passport = require('passport');
var express = require('express');
var clone = require('clone');
var login = require('connect-ensure-login');
var utils = require('../lib/util/tokens');
var oauth2orize = require('oauth2orize');



function oauth2Router(tokenconf,entityStorageConf) {
  //to see the routes go to the bottom...
  var db = require('../lib/db/')(tokenconf,entityStorageConf);

  // User info
  var user_info = [
    passport.authenticate('bearer', { session: false }),
    function(req, res) {
      // req.authInfo is set using the `info` argument supplied by
      // `BearerStrategy`.  It is typically used to indicate scope of the token,
      // and used in access control checks.  For illustrative purposes, this
      // example simply returns the scope in the response.
      res.json({ user_id: req.user.id, name: req.user.name, scope: req.authInfo.scope })
    }
  ]
  //client info
  var client_info = [
      passport.authenticate('bearer', { session: false }),
      function(req, res) {
          // req.authInfo is set using the `info` argument supplied by
          // `BearerStrategy`.  It is typically used to indicate scope of the token,
          // and used in access control checks.  For illustrative purposes, this
          // example simply returns the scope in the response.
          res.json({ client_id: req.user.id, name: req.user.name, scope: req.authInfo.scope })
      }
  ]

  //Oauth2 PROTOCOL
  //we load first the oauth2orize server
  var server = require('../lib/auth/oauth2/oauth2orize')(tokenconf, entityStorageConf);
  // user authorization endpoint
  //
  // `authorization` middleware accepts a `validate` callback which is
  // responsible for validating the client making the authorization request.  In
  // doing so, is recommended that the `redirectURI` be checked against a
  // registered value, although security requirements may vary accross
  // implementations.  Once validated, the `done` callback must be invoked with
  // a `client` instance, as well as the `redirectURI` to which the user will be
  // redirected after an authorization decision is obtained.
  //
  // This middleware simply initializes a new authorization transaction.  It is
  // the application's responsibility to authenticate the user and render a dialog
  // to obtain their approval (displaying details about the client requesting
  // authorization).  We accomplish that here by routing through `ensureLoggedIn()`
  // first, and rendering the `dialog` view.
  var  authorization = [
      login.ensureLoggedIn(),
      server.authorization(function(clientID, redirectURI, done) {
        db.clients.findByClientId(clientID, function(err, client) {
          if (err) { return done(err); }
          if(redirectURI === client.redirectURI){
            return done(null, client, redirectURI);
          }
          else{
            return done(new Error("client URL doesn't match what was expected. Provided: "+redirectURI+" expected "+client.redirectURI),null);
          }
        });
      }, function (client, user, done) {
        return done(null, true);

        //TODO fix this.....

        // Check if grant request qualifies for immediate approval
        if (user.has_token(client)) {
          // Auto-approve
          return done(null, true);
        }
        if (client.isTrusted()) {
          // Auto-approve
          return done(null, true);
        }
        // Otherwise ask user
        done(null, false);
      }),
      function(req, res){
        res.render('dialog', { transactionID: req.oauth2.transactionID, user: req.user, client: req.oauth2.client });
      }
  ];


  // user decision endpoint
  //
  // `decision` middleware processes a user's decision to allow or deny access
  // requested by a client application.  Based on the grant type requested by the
  // client, the above grant middleware configured above will be invoked to send
  // a response.

  var decision = [
    login.ensureLoggedIn(),
    server.decision()
  ];


  // token endpoint
  //
  // `token` middleware handles client requests to exchange authorization grants
  // for access tokens.  Based on the grant type being exchanged, the above
  // exchange middleware will be invoked to handle the request.  Clients must
  // authenticate when making requests to this endpoint.

  var token = [
    passport.authenticate(['oauth2-basic', 'oauth2-client-password'], { session: false }),
    server.token(),
    server.errorHandler()
  ];


  var router = express.Router();
  //oauth2 protocol
  router.route('/dialog/authorize').get(authorization);
  router.route('/dialog/authorize/decision').post(decision);
  router.route('/token').post(token);

  //querying user and client info
  router.route('/api/userinfo').get(user_info);
  router.route('/api/clientinfo').get(client_info);

  return router;
}
module.exports = oauth2Router;

/*
MIT License

Copyright (c) 2016 Gerges Beshay.

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

Modifications 2016 David Parra. Removed several sections of code and adapted some request processing
*/

var passport = require('passport');
var express = require('express');
var clone = require('clone');
var login = require('connect-ensure-login');
var utils = require('../lib/util/tokens');
var db = require('../lib/db');
var url = require('url');
var oauth2orize = require('oauth2orize');

function oauth2Router(tokenconf, entityStorageConf) {
  //to see the routes go to the bottom...
  var db = require('../lib/db/')(tokenconf, entityStorageConf);

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
  var authorization = [
    login.ensureLoggedIn(tokenconf && tokenconf.failureRedirect ? tokenconf.failureRedirect : undefined),
    function(req,res,next){

       if(req.originalUrl){
         var oauth2ReturnToParsed = url.parse(req.originalUrl, true).query;
         var clientid = oauth2ReturnToParsed.client_id;
         var response_type = oauth2ReturnToParsed.response_type;
         console.log("checking whether user is still logged in, with the token! client id from uri in " + JSON.stringify(oauth2ReturnToParsed.client_id));
         console.log("checking whether user is still logged in, with the token! response_type " + JSON.stringify(oauth2ReturnToParsed.response_type));
         if(clientid && response_type && req.user.id){
         var auth_type = req.user.auth_type;
         var user_name= req.user.user_name;
         db.accessTokens.findOauth2Token(user_name, auth_type,clientid,response_type, function (err, token) {

           if (err || !token) {
             // this means there is an inconsistency between tokens and express sessions!
             //so we logout the user from express and reload login page after logout.
             req.logout();
             return res.redirect(req.originalUrl);
           } else {
            console.log("success on checking whether user is still logged in");
            return next();
           }
         });
       }
       else{
         return next();
       }
     }else{
       return next();
     }


    },

    server.authorization(function (clientID, redirectURI, done) {
      db.clients.findByClientId(clientID, function (err, client) {
        if (err) {
          return done(err);
        }
        if (!client) {
          return done(null, false);
        }
        console.log('client ' + JSON.stringify(client));
        if (redirectURI === client.redirectURI) {
          return done(null, client, redirectURI);
        } else {
          return done(new Error("client URL doesn't match what was expected. Provided: " + redirectURI + " expected " + client.redirectURI), null);
        }
      });
    }, function (client, user, done) {
      console.log("authorization endpoint is called (either for implicit or authorization code) with client Id " + client.id + " for user id " + user.id + ". We always accept as long as client url matches");
      //TODO fix this..... have a PDP at some point here?
      return done(null, true);
      // If we want to ask the user...  This then shows the dialog, and then the decision goes with post to   router.route('/dialog/authorize/decision').post(decision);
      //return done(null,false);

      /*old code
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
      done(null, false);*/
    }),
    function (req, res) {
      res.render('dialog', {
        transactionID: req.oauth2.transactionID,
        user: req.user,
        client: req.oauth2.client
      });
    }
  ];

  // user decision endpoint
  //
  // `decision` middleware processes a user's decision to allow or deny access
  // requested by a client application.  Based on the grant type requested by the
  // client, the above grant middleware configured above will be invoked to send
  // a response.

  var decision = [
    login.ensureLoggedIn(tokenconf && tokenconf.failureRedirect ? tokenconf.failureRedirect : undefined),
    server.decision() //probably the PDP should have to be placed here (receive request and verify what the PDP says. Just get the post...)
  ];

  // token endpoint
  //
  // `token` middleware handles client requests to exchange authorization grants
  // for access tokens.  Based on the grant type being exchanged, the above
  // exchange middleware will be invoked to handle the request.  Clients must
  // authenticate when making requests to this endpoint.

  var token = [
    passport.authenticate(['oauth2-basic', 'oauth2-client-password'], {
      session: false
    }),
    server.token(),
    server.errorHandler()
  ];

  var user_info = [
    passport.authenticate('agile-bearer', {
      session: false
    }),
    function (req, res) {
      // req.authInfo is set using the `info` argument supplied by
      // `BearerStrategy`.  It is typically used to indicate scope of the token,
      // and used in access control checks.  For illustrative purposes, this
      // example simply returns the scope in the response.
      res.json({
        id: req.user.id,
        user_name: req.user.user_name,
        auth_type: req.user.auth_type,
        scope: req.authInfo.scope
      })
    }
  ];

  //client info
  var client_info = [
    passport.authenticate('agile-bearer', {
      session: false
    }),
    function (req, res) {
      // req.authInfo is set using the `info` argument supplied by
      // `BearerStrategy`.  It is typically used to indicate scope of the token,
      // and used in access control checks.  For illustrative purposes, this
      // example simply returns the scope in the response.
      res.json({
        client_id: req.authInfo.clientId,
        auth_type: req.authInfo.auth_type,
        scope: req.authInfo.scope /*req.user is also there*/
      })
    }
  ];

  var router = express.Router();
  //enabling cors
  var cors_wrapper = require('./cors_wrapper')(tokenconf);
  router.route('*').options(cors_wrapper);
  router.use("*",cors_wrapper);
  //oauth2 protocol
  router.route('/dialog/authorize').get(authorization);
  router.route('/dialog/authorize/decision').post(decision);
  router.route('/token').post(token);

  //querying user and client info

  router.route('/api/userinfo').get(user_info);
  router.route('/api/clientinfo').get(client_info);
  //logout
  router.route('/logout').get( passport.authenticate('internal-agile-return-token-bearer', {
      session: false
    }),function(req,res){
      db.accessTokens.logOut(req.authInfo.token, function(error, data){
          if(req.logout){
            req.logout();
          }
          res.json({"success":true});
      })

  });

  return router;
}
module.exports = oauth2Router;

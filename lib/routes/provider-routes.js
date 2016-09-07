
var passport = require('passport');
var express = require('express');

function RouterPassport(conf, app){

  var failUrl = '/static/error/error.html';
  var router = express.Router();

    //local strategy (REST API JSON)
  router.route('/local').post(
    passport.authenticate('local',{ failureRedirect: failUrl,
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true

      }),
      function(req, res) {
        console.log("session id"+req.session.id);
        console.log("session cookie"+JSON.stringify(req.session.cookie));
        res.redirect('/static/idm/authenticateUser.html');
      }

  );

  //Github
  router.route('/github').get(
    passport.authenticate('github'),
    function(req, res){});
  router.route('/callback_github').get(
    passport.authenticate('github', { failureRedirect: failUrl }),
    function(req, res) {
      console.log("session id"+req.session.id);
      console.log("session cookie"+JSON.stringify(req.session.cookie));
      res.redirect('/static/index.html');
    });

  //Google
  router.route('/google').get(
    passport.authenticate('google', {  }
  ));
  //TODO place into router later! Fix README first!
  app.get/*router.route*/('/callback_google'/*).get(*/,
    passport.authenticate('google', { failureRedirect: failUrl }),
    function(req, res) {
      console.log("session id"+req.session.id);
      console.log("session cookie"+JSON.stringify(req.session.cookie));
      res.redirect('/static/index.html');
  });

  router.route('/web_id').get(
     //TODO adjust to show errors with express properly. check example in the webid passport (Agile-IoT) it handles errors with ejs and failureFlash true
     passport.authenticate('webid', { failureRedirect: failUrl,  passReqToCallback: true, failureFlash: false   }),
         function(req, res) {
               res.redirect('/static/idm/authenticateUser.html');
  });

  return router;

}
module.exports = RouterPassport;

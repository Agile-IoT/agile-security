
var passport = require('passport');
var express = require('express');

function RouterPassport(app){

  var router = express.Router();

  router.route('/local').post(
    passport.authenticate('local',
      { failureRedirect: '/login',
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: false

      }, function(req, res) {

       }
   ));

  //Github
  router.route('/github').get(
    passport.authenticate('github'),
    function(req, res){});
  router.route('/callback_github').get(
    passport.authenticate('github', { failureRedirect: '/' }),
    function(req, res) {
      console.log("session id"+req.session.id);
      console.log("session cookie"+JSON.stringify(req.session.cookie));
      res.redirect('/account');
    });

  //Google
  router.route('/google').get(
    passport.authenticate('google', {  }
  ));
  //TODO place into router later! Fix README first!
  app.get/*router.route*/('/callback_google'/*).get(*/,
    passport.authenticate('google', { failureRedirect: '/' }),
    function(req, res) {
      console.log("session id"+req.session.id);
      console.log("session cookie"+JSON.stringify(req.session.cookie));
      res.redirect('/account');
  });
  return router;
}
module.exports = RouterPassport;

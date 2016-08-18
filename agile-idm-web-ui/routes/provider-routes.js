
var passport = require('passport');
var express = require('express');

function RouterPassport(app){

  var router = express.Router();

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
  app.get('/google',
    passport.authenticate('google', {  }
  ));
  app.get('/callback_google',
    passport.authenticate('google', { failureRedirect: '/' }),
    function(req, res) {
      console.log("session id"+req.session.id);
      console.log("session cookie"+JSON.stringify(req.session.cookie));
      res.redirect('/account');
    });
  return router;
}
module.exports = RouterPassport;

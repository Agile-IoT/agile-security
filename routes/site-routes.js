var passport = require('passport');
var express = require('express');
var clone = require('clone');
var login = require('connect-ensure-login');


function siteRouter() {
  var router = express.Router();

  router.route('/').get(function(req, res) {
    res.send('AGILE IDM server... you need a client to use it (preferably using Authroziation code grant for Oauth2)');
  });

  router.route('/login').get(function(req, res) {
    res.render('login');
  });

  router.route('/login').post(
     passport.authenticate('agile-local', { successReturnToOrRedirect: '/', failureRedirect: '/login' })
  );

  router.route('/logout').get(function(req, res) {
    req.logout();
    res.redirect('/');
  });

  router.route('/account').get(login.ensureLoggedIn(),
    function(req, res) {
      res.render('account', { user: req.user });
  });

  return router;
}
module.exports = siteRouter;

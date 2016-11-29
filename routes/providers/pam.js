var passport = require('passport');
var express = require('express');

function RouterPassport(router) {

  //pam
  router.route('/pam').get(function(req, res) {
    res.render('local');
  });

  router.route('/pam').post(
    passport.authenticate('pam', {
      successReturnToOrRedirect: '/', failureRedirect: '/login'
    })
  );
  return router;
}
module.exports = RouterPassport;

var passport = require('passport');
var express = require('express');

function RouterPassport(router) {

  //webid
  router.route('/webid').get(
    passport.authenticate('webid', {
      successReturnToOrRedirect: '/', failureRedirect: '/login',
      passReqToCallback: true
      //failureFlash: false
    })
  );
  return router;
}
module.exports = RouterPassport;

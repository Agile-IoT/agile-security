var passport = require('passport');
var express = require('express');

function RouterPassport(router, conf) {

  //webid
  router.route('/webid').get(
    passport.authenticate('webid', {
      successReturnToOrRedirect: '/',
      failureRedirect: conf.failureRedirect,
      passReqToCallback: true
      //failureFlash: false
    })
  );
  return router;
}
module.exports = RouterPassport;

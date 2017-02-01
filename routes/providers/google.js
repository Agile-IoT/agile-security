var passport = require('passport');
var express = require('express');

function RouterPassport(router, conf) {

  //Google
  router.route('/google').get(
    passport.authenticate('google', {}));
  router.route('/callback_google').get(
    passport.authenticate('google', {
      successReturnToOrRedirect: '/',
      failureRedirect: conf.failureRedirect
    })
  );
  return router;
}
module.exports = RouterPassport;

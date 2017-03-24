var passport = require('passport');
var express = require('express');

function RouterPassport(router, conf) {

  //Github
  router.route('/dropbox').get(
    passport.authenticate('dropbox'),
    function (req, res) {}
  );

  router.route('/callback_dropbox').get(
    passport.authenticate('dropbox', {
      successReturnToOrRedirect: '/',
      failureRedirect: conf.failureRedirect
    })
    //handleRedirect.bind(this, "github")
  );
  return router;
}
module.exports = RouterPassport;

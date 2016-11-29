var passport = require('passport');
var express = require('express');

function RouterPassport(router) {

  //Local
  router.route('/agile-local').get(function(req, res) {
    res.render('local');
  });
  router.route('/agile-local').post(
     passport.authenticate('agile-local'/*'github'*/, { successReturnToOrRedirect: '/', failureRedirect: '/login', failureFlash: true  })
  );
  return router;
}
module.exports = RouterPassport;

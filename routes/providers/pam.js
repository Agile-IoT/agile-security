var passport = require('passport');
var express = require('express');

function RouterPassport(router) {

  //pam
  router.route('/pam').get(function (req, res) {
    var options = [{
      "name": "username",
      "type": "text",
      "label": "username"
    }, {
      "name": "password",
      "type": "password",
      "label": "password"
    }];
    res.render('local', {
      auth_type: 'pam',
      fields: options
    });
  });

  router.route('/pam').post(
    passport.authenticate('pam', {
      successReturnToOrRedirect: '/',
      failureRedirect: '/login'
    })
  );
  return router;
}
module.exports = RouterPassport;

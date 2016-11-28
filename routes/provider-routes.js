var passport = require('passport');
var express = require('express');

function RouterPassport(conf) {


  var router = express.Router();


  //Github
  router.route('/github').get(
    passport.authenticate('github'),
    function (req, res) {}
  );

  router.route('/callback_github').get(
    passport.authenticate('github', {
      successReturnToOrRedirect: '/', failureRedirect: '/login'
    })
    //handleRedirect.bind(this, "github")
  );

  router.route('/local').get(function(req, res) {
    res.render('local');
  });
  router.route('/local').post(
     passport.authenticate('agile-local'/*'github'*/, { successReturnToOrRedirect: '/', failureRedirect: '/login', failureFlash: true  })
  );
  //local strategy (REST API JSON)
  /*router.route('/local').post(
    passport.authenticate('agile-local', {
      successReturnToOrRedirect: '/',
      failureRedirect: '/login',
      //usernameField: 'username',
      //passwordField: 'password',
      //<passReqToCallback: true,
      //failureFlash: true

    })//,
    //function(req, res) {
    //   res.render('login');
    //}
  );*/
  router.route('/pam').get(function(req, res) {
    res.render('pam');
  });
  
  router.route('/pam').post(
    passport.authenticate('pam', {
      successReturnToOrRedirect: '/', failureRedirect: '/login'
    })
  );


  //Google
  router.route('/google').get(
    passport.authenticate('google', {}));
  router.route('/callback_google').get(
      passport.authenticate('google', {
        successReturnToOrRedirect: '/', failureRedirect: '/login'
      })
  );

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

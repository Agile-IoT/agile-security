var passport = require('passport');
var express = require('express');
var clone = require('clone');
var login = require('connect-ensure-login');

function siteRouter(stategies, tokenconf) {
  var router = express.Router();

  router.route('/').get(function (req, res) {
    res.send('AGILE IDM server... you need a client to use it (preferably using Authroziation code grant for Oauth2)');
  });

  router.route('/login').get(function (req, res) {
    var auth = [];
    stategies.forEach(function (str) {

      var n = str.lastIndexOf(".js");
      if (n > 0){
        var name = str.substr(0, n);
        auth.push({"name":name, "link":"/auth/"+name});
      }

    });
    console.log('paths: ' + JSON.stringify(auth));
    res.render('index', {
      "auth": auth
    });
  });

  //router.route('/login').post(
  //   passport.authenticate('agile-local'/*'github'*/, { successReturnToOrRedirect: '/', failureRedirect: '/login', failureFlash: true  })
  //);

  router.route('/logout').get(function (req, res) {
    req.logout();
    //TODO update to delete tokens here?
    res.redirect('/');
  });

  return router;
}
module.exports = siteRouter;

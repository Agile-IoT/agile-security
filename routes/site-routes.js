var passport = require('passport');
var express = require('express');
var clone = require('clone');
var login = require('connect-ensure-login');

function siteRouter(stategies, tokenconf) {
  var router = express.Router();

  router.route('/').get(function (req, res) {
    res.send('AGILE IDM server... you need a client to use it (preferably using Authroziation code grant for Oauth2. Check https://github.com/Agile-IoT/agile-idm-oauth2-client-example)');
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



  return router;
}
module.exports = siteRouter;

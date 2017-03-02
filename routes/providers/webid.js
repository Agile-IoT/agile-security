var passport = require('passport');
var express = require('express');

function RouterPassport(router, conf) {

  //webid
  router.route('/webid').get(
    function (req, res, next) {
      if (req.protocol === "http") {
        console.log("session " + JSON.stringify(req.session));
        var dest = "https://" + req.get('host').replace(":" + conf.http_port, ":" + conf.https_port_with_client) + req.session.returnTo; //+  req.originalUrl;
        console.log("sending to " + dest)
        res.redirect(dest);
      } else {
        next();
      }
    },
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

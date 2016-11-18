var cors = require('cors');
var passport = require('passport');
var express = require('express');
var clone = require('clone');

function RouterApi(app) {

  var router = express.Router();
  router.route('/').get(
    cors(),
    passport.authenticate('agile-oauth2-token', {
      session: false
    }),

    function (req, res) {
      //tell who the user is... remove tokens maybe later?
      if (req.user) {
        var user = clone(req.user);
        res.json(user);
      } else {
        res.status(401).json({
          "error": "not authenticated"
        })
      }

    }
  );
  return router;
}
module.exports = RouterApi;



var cors = require('cors');
var passport = require('passport');
var express = require('express');
var clone = require('clone');

function RouterApi(app){

  var router = express.Router();
  router.route('/').get(
          cors(),
          passport.authenticate('bearer', { session: false }),
          function(req, res) {
               //tell who the user is... remove tokens maybe later?
               var user = clone(req.user);
               if(user.hasOwnProperty("scope"))
                 user.scope = JSON.parse(user.scope);

               res.json(user);
         }
  );
  return router;
}
module.exports = RouterApi;

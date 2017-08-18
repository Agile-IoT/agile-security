var passport = require('passport');
var express = require('express');
var clone = require('clone');
var bodyParser = require('body-parser');
var ids = require('../../lib/util/id');
var createError = require('http-errors');

function RouterApi(tokenConf, idmcore, audit, router) {

  this.pdp = pdp;
  this.idmcore = idmcore;
  var cors_wrapper = require('../cors_wrapper')(tokenConf);
  router.route('*').options(cors_wrapper);
  router.use("*", cors_wrapper);

  //example to call tthis one
  // curl -I -H "Authorization: bearer $TOKEN" -H "Content-Type: application/json" -XGET 'http://localhost:3000/api/v1/audit/actions/myEntities'
  //returns actions inside result array with 200 if OK, else, it can return 404 if the entity is not found, 401 or 403 in case of security errors or 500 in case of unexpected situations
  router.route('/audit/actions/myEntities').get(
    passport.authenticate('agile-bearer', {
      session: false
    }),
    bodyParser.json(),
    function (req, res) {
      audit.getActionsByOwner(req.user.id).then(function(actions){
        res.json({
          result: actions
        });
      }).catch(function (err) {
        res.statusCode = error.statusCode || 500;
        res.json({
          "error": error.message
        });
      })

    }
  );

  router.route('/audit/actions/byMe').get(
    passport.authenticate('agile-bearer', {
      session: false
    }),
    bodyParser.json(),
    function (req, res) {
      audit.getActionsByMe(req.user.id).then(function(actions){
        res.json({
          result: actions
        });
      }).catch(function (err) {
        res.statusCode = error.statusCode || 500;
        res.json({
          "error": error.message
        });
      })

    }
  );

}
module.exports = RouterApi;

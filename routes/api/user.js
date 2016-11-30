var cors = require('cors');
var passport = require('passport');
var express = require('express');
var clone = require('clone');
var bodyParser = require('body-parser');
var ids = require('../../lib/util/id');
var idmcore;

function RouterApi(idmcore, router, strategies) {

  var stripped_strategies = strategies.map(function (value) {
    var n = value.lastIndexOf(".js");
    if (n > 0)
      return (value.substr(0, n));
  });

  //returns 400 if a field of the body is missing or if wrong authentication type is provided. returns 200 and the entity, or 401 or 403, in case of security issues, 422 in case a user is attempted to be created through this API, or 409 if entity already exists, 500 in case of unexpected situations
  //curl -H "Content-type: application/json" -H "Authorization: bearer HeTxINCpXD0U6g27D7AIxc2CvfFNaZ" -X POST -d '{"user_name":"a", "auth_type":"github"}' 'http://localhost:3000/api/v1/user'
  router.route('/user/').post(
    cors(),
    passport.authenticate('bearer', {
      session: false
    }),
    bodyParser.json(),
    function (req, res) {
      if (!req.body.user_name || !req.body.auth_type) {
        res.statusCode = 400;
        return res.json({
          "error": "provide user_name and auth_type at least"
        });
      } else {
        var is = stripped_strategies.filter(function (v) {
          return (v === req.body.auth_type);
        })
        if (is.length <= 0) {
          res.statusCode = 400;
          return res.json({
            "error": "wrong authentication type"
          });
        }
        var user = req.body;
        var entity_type = "/user";
        var entity_id = ids.buildId(req.body.user_name, req.body.auth_type);
        idmcore.createEntity(req.user, entity_id, entity_type, user)
          .then(function (read) {
            res.json(read);
          }).catch(function (error) {
            console.log("error when posting entity " + error);
            res.statusCode = error.statusCode;
            res.json({
              "error": error.message
            });
          });
      }
    }
  );

  //returns 200 and the entity, or 401 or 403, in case of security issues, 400 in case there is not enough parameters. or 409 if entity already exists, 500 in case of unexpected situations
  //curl -H "Authorization: bearer ypr24DKllIbKlV3Ph8oWmZ7Pml3Wku" 'http://localhost:3000/api/v1/user/?user_name=bob&auth_type=agile-local'
  router.route('/user/').get(
    cors(),
    passport.authenticate('bearer', {
      session: false
    }),
    bodyParser.json(),
    function (req, res) {
      var entity_type = "/user";
      if (!req.query.user_name || !req.query.auth_type) {
        res.statusCode = 400;
        return res.json({
          "error": "provide user_name and auth_type at least as query parameters"
        });
      }
      var entity_id = req.params.entity_id;
      idmcore.readEntity(req.user, ids.buildId(req.query.user_name, req.query.auth_type), entity_type)
        .then(function (read) {
          res.json(read);
        }).catch(function (error) {
          console.log("error when reading user " + error);
          res.statusCode = error.statusCode;
          res.json({
            "error": error.message
          });
        });

    }
  );
}
module.exports = RouterApi;

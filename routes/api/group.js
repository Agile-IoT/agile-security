var cors = require('cors');
var passport = require('passport');
var express = require('express');
var clone = require('clone');
var IdmCore = require('agile-idm-core');
var bodyParser = require('body-parser');
var ids = require('../../lib/util/id');
var idmcore;

function RouterApi(idmcore,router) {
  //example to call tthis one
  //  returns 200 and the group, or 401 or 403, in case of security issues, or  400 if parameters are missing. 500 in case of unexpected situations

  // curl -H "Authorization: bearer nNGNryDDZ4zQYeWYGYcnOdxJ90k9s6" 'http://localhost:3000/api/v1/entity/user/bob!@!agile-local'
  //returns entity with 200 if OK, else, it can return 404 if the entity is not found, 401 or 403 in case of security errors or 500 in case of unexpected situations
  router.route('/group/').get(
    cors(),
    passport.authenticate('bearer', {
      session: false
    }),
    function (req, res) {
      if (!req.query.group_name || !req.query.owner) {
        res.statusCode = 400;
        return res.json({
          "error": "provide group_name and owner at least"
        });
      } else {
        idmcore.readGroup(req.user, req.query.group_name, req.query.owner)
          .then(function (read) {
            res.json(read);
          }).catch(function (error) {
            res.statusCode = error.statusCode;
            res.json({
              "error": error.message
            });
          });
      }
  });

  //returns 200 and the group, or 401 or 403, in case of security issues, or 409 if the group already exists, 400 if parameters are missing. 500 in case of unexpected situations
  //curl -H "Content-type: application/json" -H "Authorization: bearer ypr24DKllIbKlV3Ph8oWmZ7Pml3Wku" -d '{"group_name":"me", "owner":"nopbyte@github"}' 'http://localhost:3000/api/v1/group/'
  router.route('/group/').post(
    cors(),
    passport.authenticate('bearer', {
      session: false
    }),
    bodyParser.json(),
    function (req, res) {
      var group = req.body;
      if (!req.body.group_name) {
        res.statusCode = 400;
        return res.json({
          "error": "provide group_name in the body"
        });
      } else {

        idmcore.createGroup(req.user, req.body.group_name)
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
  });

}
module.exports = RouterApi;

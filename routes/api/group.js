var passport = require('passport');
var express = require('express');
var clone = require('clone');
var IdmCore = require('agile-idm-core');
var bodyParser = require('body-parser');
var ids = require('../../lib/util/id');
var idmcore;

function RouterApi(tokenConf, idmcore, router) {

  //enable cors
  var cors_wrapper = require('../cors_wrapper')(tokenConf);
  router.route('*').options(cors_wrapper);
  router.use("*", cors_wrapper);

  //example to call tthis one
  //  returns 200 and the list of groups group, or 403, in case of security issues. 500 in case of unexpected situations
  // curl -H "Authorization: bearer $TOKEN" 'http://localhost:3000/api/v1/group/'
  //returns entity with 200 if OK, else, it can return an empty array if the entity is not found, 401 or 403 in case of security errors or 500 in case of unexpected situations
  router.route('/group/').get(
    passport.authenticate('agile-bearer', {
      session: false
    }),
    function (req, res) {

      idmcore.readGroups(req.user)
        .then(function (read) {
          res.json(read);
        }).catch(function (error) {
          res.statusCode = error.statusCode || 500;
          res.json({
            "error": error.message
          });
        });

    });

  //example to call tthis one
  //  returns 200 and the group, or 401 or 403, in case of security issues. 500 in case of unexpected situations
  //this line returns the group with name me, owned by bob who is authenticated with agile-local authentication type
  // curl -H "Content-type: application/json" -H "Authorization: bearer ypr24DKllIbKlV3Ph8oWmZ7Pml3Wku" 'http://localhost:3000/api/v1/user/bob!@!agile-local/group/me/'
  //returns entity with 200 if OK, else, it can return 404 if the entity is not found, 401 or 403 in case of security errors or 500 in case of unexpected situations
  router.route('/user/:owner/group/:name').get(
    passport.authenticate('agile-bearer', {
      session: false
    }),
    function (req, res) {

      idmcore.readGroup(req.user, req.params.name, req.params.owner)
        .then(function (read) {
          res.json(read);
        }).catch(function (error) {
          res.statusCode = error.statusCode || 500;
          res.json({
            "error": error.message
          });
        });

    });

  //returns 200 and the group, or 401 or 403, in case of security issues, or 409 if the group already exists, 400 if parameters are missing. 500 in case of unexpected situations
  //curl -H "Content-type: application/json" -H "Authorization: bearer ypr24DKllIbKlV3Ph8oWmZ7Pml3Wku" -d '{"group_name":"me", "owner":"nopbyte@github"}' 'http://localhost:3000/api/v1/group/'
  router.route('/group/').post(
    passport.authenticate('agile-bearer', {
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
            console.log("error when posting group " + error);
            res.statusCode = error.statusCode || 500;
            res.json({
              "error": error.message
            });
          });
      }
    });

  //example to call tthis one
  //  returns 200 if the group os deleted, or 401 or 403, in case of security issues. 500 in case of unexpected situations
  //this line returns the group with name me, owned by bob who is authenticated with agile-local authentication type
  // curl -H "Content-type: application/json" -H "Authorization: bearer FWrt4MRCEoravyzF1LkPoWzWvKfVBc" '-X DELETE http://localhost:3000/api/v1/user/bob!@!agile-local/group/me/'
  //returns entity with 200 if OK, else, it can return 404 if the entity is not found, 401 or 403 in case of security errors or 500 in case of unexpected situations
  router.route('/user/:owner/group/:name').delete(
    passport.authenticate('agile-bearer', {
      session: false
    }),
    function (req, res) {

      idmcore.deleteGroup(req.user, req.params.name, req.params.owner)
        .then(function (read) {
          res.json(read);
        }).catch(function (error) {
          res.statusCode = error.statusCode || 500;
          res.json({
            "error": error.message
          });
        });

    });

  //returns 200 and the group, or 401 or 403, in case of security issues, or 409 if the entity is  already in the group. or 404 in case the entity or the group are not found. 400 if parameters are missing. 500 in case of unexpected situations
  //this line adds the entity of type sensor and id 1, to the group called me and owned by bob who is authenticated with agile-local
  //curl -H "Content-type: application/json" -H "Authorization: bearer ypr24DKllIbKlV3Ph8oWmZ7Pml3Wku" -X POST 'http://localhost:3000/api/v1/user/bob!@!agile-local/group/me/entities/sensor/1'
  router.route('/user/:owner/group/:name/entities/:entity_type/:id').post(
    passport.authenticate('agile-bearer', {
      session: false
    }),
    bodyParser.json(),
    function (req, res) {

      idmcore.addEntityToGroup(req.user, req.params.name, req.params.owner, req.params.id, "/" + req.params.entity_type)
        .then(function (read) {
          res.json(read);
        }).catch(function (error) {
          console.log("error when adding membership to a  group " + error);
          res.statusCode = error.statusCode || 500;
          res.json({
            "error": error.message
          });
        });
    });

  //returns 200 and the group, or 401 or 403, in case of security issues, or 409 if the entity is not  in the group. or 404 in case the entity or the group are not found. 400 if parameters are missing. 500 in case of unexpected situations
  //this line adds the entity of type sensor and id 1, to the group called me and owned by bob who is authenticated with agile-local
  //curl -H "Content-type: application/json" -H "Authorization: bearer ypr24DKllIbKlV3Ph8oWmZ7Pml3Wku" -X DELETE 'http://localhost:3000/api/v1/user/bob!@!agile-local/group/me/entities/sensor/1'
  router.route('/user/:owner/group/:name/entities/:entity_type/:id').delete(
    passport.authenticate('agile-bearer', {
      session: false
    }),
    bodyParser.json(),
    function (req, res) {

      idmcore.removeEntityFromGroup(req.user, req.params.name, req.params.owner, req.params.id, "/" + req.params.entity_type)
        .then(function (read) {
          res.json(read);
        }).catch(function (error) {
          console.log("error when deleting membership from group " + error);
          res.statusCode = error.statusCode || 500;
          res.json({
            "error": error.message
          });
        });
    });

}
module.exports = RouterApi;

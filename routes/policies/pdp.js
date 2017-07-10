var passport = require('passport');
var express = require('express');
var clone = require('clone');
var IdmCore = require('agile-idm-core');
var bodyParser = require('body-parser');
var ids = require('../../lib/util/id');
var createError = require('http-errors');
var pdp = require('UPFROnt').pdp;

var idmcore;

function RouterApi(tokenConf, idmcore, pdp_conf, router) {
  //TODO once we have proper integration in the agile-idm-core remove this horrible hack!!!
  /*idmcore.getPdp = function(){
    return this.pdp;
  }
  var pdp = idmcore.getPdp();*/
  function evaluateObjectPolicy(user, entity_id, entity_type, action_info) {
    return new Promise(function (resolve, reject) {
      idmcore.readEntity(user, entity_id, entity_type)
        .then(function (entity) {
          console.log("user" + JSON.stringify(user));
          console.log("entity" + JSON.stringify(entity));

          console.log("is there a policty" + JSON.stringify(pdp_conf.device.specific_policies[action_info.action]));
          var policy = pdp_conf.device.specific_policies[action_info.action.toLowerCase()] || pdp_conf.device.top_level_policy;
          if (action_info.operation.toUpperCase() === "GET") {
            pdp.checkRead(user, pdp_conf.default_actor, entity, policy).then(function (result) {
              resolve(result);
            }).catch(function (error) {
              resolve({
                result: false,
                error: error
              });
            });
          } else if (action_info.operation.toUpperCase() === "POST" || action_info.operation.toUpperCase() === "PUT" || action_info.operation.toUpperCase() === "DELETE") {
            pdp.checkWrite(user, pdp_conf.default_actor, entity, policy).then(function (result) {
              resolve(result);
            }).catch(function (error) {
              resolve({
                result: false,
                error: error
              });
            });
          } else {
            resolve({
              result: false,
              error: "unknown kind of operation"
            });
          }
        }).catch(function (error) {
          reject(createError(error.statusCode || 500, error.message || "unknown error"));
        });
    })

  }

  function evaluateActionPolicy(user, action_info) {

    //This policy evaluation "tricks" Upfront by passing an entity that is not relevant... we do this to evaluate just the policy based on the source of data, i.e. user executing the action
    return new Promise(function (resolve, reject) {
      console.log("user" + JSON.stringify(user));

      console.log("is there a policty" + JSON.stringify(pdp_conf.management.specific_policies[action_info.action.toLowerCase()]));
      var policy = pdp_conf.management.specific_policies[action_info.action.toLowerCase()] || pdp_conf.management.top_level_policy;
      if (action_info.operation.toUpperCase() === "GET") {
        pdp.checkRead(user, pdp_conf.default_actor, {
          id: "something",
          type: "/user"
        }, policy).then(function (result) {
          resolve(result);
        }).catch(function (error) {
          resolve({
            result: false,
            error: error
          });
        });
      } else if (action_info.operation.toUpperCase() === "POST" || action_info.operation.toUpperCase() === "PUT" || action_info.operation.toUpperCase() === "DELETE") {
        pdp.checkWrite(user, pdp_conf.default_actor, {
          id: "something",
          type: "/user"
        }, policy).then(function (result) {
          resolve(result);
        }).catch(function (error) {
          resolve({
            result: false,
            error: error
          });
        });
      } else {
        resolve({
          result: false,
          error: "unknown kind of operation"
        });
      }
    });

  } //enable cors
  var cors_wrapper = require('../cors_wrapper')(tokenConf);
  router.route('*').options(cors_wrapper);
  router.use("*", cors_wrapper);

  //example to call tthis one
  // curl -H "Authorization: bearer $TOKEN" -H "Content-Type: application/json"  -XPOST 'http://localhost:3000/api/v1/pdp/entity/device/123/' -d '{"action":"status", "operation":"get"}'  // GET /device/{deviceId}/status
  //returns entity with 200 if OK, else, it can return 404 if the entity is not found, 401 or 403 in case of security errors or 500 in case of unexpected situations
  router.route('/pdp/data/:entity_type/:entity_id/').post(
    passport.authenticate('agile-bearer', {
      session: false
    }),
    bodyParser.json(),
    function (req, res) {
      var entity_type = "/" + req.params.entity_type;
      var entity_id = req.params.entity_id;
      var user = req.user;
      var action_info = req.body;
      if (!action_info.action || !action_info.operation) {
        res.statusCode = 400;
        res.json({
          "error": "no action or operation provided in the body"
        });
      }
      evaluateObjectPolicy(user, entity_id, entity_type, action_info).then(function (result) {
        res.json(result);
      }).catch(function (error) {
        res.statusCode = error.statusCode || 500;
        res.json({
          "error": error.message
        });
      });
    }
  );

  //example to call tthis one
  // curl -H "Authorization: bearer $TOKEN" -H "Content-Type: application/json"  -XPOST 'http://localhost:3000/api/v1/pdp/data/device/123/componentId' -d '{"action":"status", "operation":"get"}'  // GET /device/{deviceId}/status
  //returns entity with 200 if OK, else, it can return 404 if the entity is not found, 401 or 403 in case of security errors or 500 in case of unexpected situations
  router.route('/pdp/data/:entity_type/:entity_id/:componentId').post(
    passport.authenticate('agile-bearer', {
      session: false
    }),
    bodyParser.json(),
    function (req, res) {
      var entity_type = "/" + req.params.entity_type;
      var entity_id = req.params.entity_id;
      var user = req.user;
      var action_info = req.body;
      if (!action_info.action || !action_info.operation) {
        res.statusCode = 400;
        res.json({
          "error": "no action or operation provided in the body"
        });
      }
      //TODO update the evaluation of the componentId... For this, we need the PAP integrated, and we need to have a components property in the policies, and inside the policy for each channel
      evaluateObjectPolicy(user, entity_id, entity_type, action_info).then(function (result) {
        res.json(result);
      }).catch(function (error) {
        res.statusCode = error.statusCode || 500;
        res.json({
          "error": error.message
        });
      });
    }
  );

  router.route('/pdp/management/').post(
    passport.authenticate('agile-bearer', {
      session: false
    }),
    bodyParser.json(),
    function (req, res) {
      var entity_type = "/" + req.params.entity_type;
      var entity_id = req.params.entity_id;
      var user = req.user;
      var action_info = req.body;
      if (!action_info.action || !action_info.operation) {
        res.statusCode = 400;
        res.json({
          "error": "no action or operation provided in the body"
        });
      }
      evaluateActionPolicy(user, action_info).then(function (result) {
        res.json(result);
      }).catch(function (error) {
        res.statusCode = error.statusCode || 500;
        res.json({
          "error": error.message
        });
      });
    }
  );

}
module.exports = RouterApi;

var passport = require('passport');
var express = require('express');
var clone = require('clone');
var bodyParser = require('body-parser');
var ids = require('../../lib/util/id');
var createError = require('http-errors');

function RouterApi(tokenConf, idmcore, pdp, router) {

  this.pdp = pdp;
  this.idmcore = idmcore;
  var cors_wrapper = require('../cors_wrapper')(tokenConf);
  router.route('*').options(cors_wrapper);
  router.use("*", cors_wrapper);

  function handleReq(method, req, res) {
    var entity_type = "/" + req.params.entity_type;
    var entity_id = req.params.entity_id;
    var user = req.user;
    var path = req.path.split('/');
    if (path.length < 4) {
      res.statusCode = 500;
      res.json({
        "error": "expected a path with more slashes (at least 4)"
      });
    } else {
      var action_info = path.splice(4).join('.');
      evaluateActionPolicy(user, entity_id, entity_type, action_info, method).then(function (result) {
        res.json(result);
      }).catch(function (error) {
        res.statusCode = error.statusCode || 500;
        res.json({
          "error": error.message
        });
      });
    }
  }

  function evaluateActionPolicy(userInfo, entity_id, entity_type, action, method) {
    var that = this;
    return new Promise(function (resolve, reject) {
      console.log('action is ' + action);
      that.idmcore.readEntity(userInfo, entity_id, entity_type)
        .then(function (entityInfo) {
          if (method === "read") {
            return that.pdp.canReadEntityAttribute(userInfo, entityInfo, action);
          } else {
            return that.pdp.canWriteToAttribute(userInfo, entityInfo, action);
          }

        }).then(function (res) {
          resolve(res);
        }).catch(function (error) {
          reject(error);
        });
    });
  }

  function alwaysResolve(promise) {
    return new Promise(function (resolve, reject) {
      promise.then(resolve.bind(this, true)).catch(resolve.bind(this, false));
    });
  }
  //example to call tthis one
  // curl -I -H "Authorization: bearer $TOKEN" -H "Content-Type: application/json" -XGET 'http://localhost:3000/api/v1/pdp/sensor/1/actions/status'
  // GET /device/{deviceId}/status
  //returns entity with 200 if OK, else, it can return 404 if the entity is not found, 401 or 403 in case of security errors or 500 in case of unexpected situations
  router.route('/pdp/:entity_type/:entity_id/*').get(
    passport.authenticate('agile-bearer', {
      session: false
    }),
    bodyParser.json(),
    handleReq.bind(this, 'read')
  );

  router.route('/pdp/:entity_type/:entity_id/*').post(
    passport.authenticate('agile-bearer', {
      session: false
    }),
    bodyParser.json(),
    handleReq.bind(this, 'write')
  );

  router.route('/pdp/:entity_type/:entity_id/*').put(
    passport.authenticate('agile-bearer', {
      session: false
    }),
    bodyParser.json(),
    handleReq.bind(this, 'write')
  );

  router.route('/pdp/:entity_type/:entity_id/*').delete(
    passport.authenticate('agile-bearer', {
      session: false
    }),
    bodyParser.json(),
    handleReq.bind(this, 'write')
  );

  /*
   curl  -H "Authorization: bearer $TOKEN" -H "Content-Type: application/json" -XPOST -d '{"actions": [{"entityId":"self", "entityType":"/gateway", "method":"write","field":"action.status"},{"entityId":"alice!@!agile-local", "entityType":"/user", "method":"read","field":"id"}]}' 'http://localhost:3000/api/v1/pdp/batch'
   result can have HTTP status code 401 or 403 and be unauthorized or it can be 200 and contain something like
   {"result":[false,true]}
   in this case the array matches one-to-one the actions in the query.

  */
  router.route('/pdp/batch/').post(
    passport.authenticate('agile-bearer', {
      session: false
    }),
    bodyParser.json(),
    function (req, res) {
      if (req.body && req.body.hasOwnProperty("actions")) {
        var user = req.user;
        var ps = [];
        req.body.actions.forEach(function (action) {
          if (action.entityId && action.entityType && action.field && action.method) {
            if (action.entityType.indexOf('/') !== 0) {
              action.entityType = '/' + action.entityType;
            }
            ps.push(alwaysResolve(evaluateActionPolicy(user, action.entityId, action.entityType, action.field, action.method)));
          }
        });
        if (ps.length !== req.body.actions.length) {
          res.statusCode = 400;
          return res.json({
            "error": "ensure that every action has action.entityId && action.entityType && action.field && action.method"
          });
        } else {
          Promise.all(ps).then(function (r) {
            res.json({
              result: r
            });
          }).catch(function (err) {
            res.statusCode = error.statusCode || 500;
            res.json({
              "error": error.message
            });
          })
        }

      } else {
        res.statusCode = 400;
        res.json({
          "error": "no actions array specified in the body"
        });
        return;
      }
    }
  );

}
module.exports = RouterApi;

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
      var action_info = 'actions.' + path.splice(4).join('.');
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
  //example to call tthis one
  // curl -I -H "Authorization: bearer $TOKEN" -H "Content-Type: application/json" -XGET 'http://localhost:3000/api/v1/pdp/sensor/1/status'
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

}
module.exports = RouterApi;

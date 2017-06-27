var passport = require('passport');
var express = require('express');
var clone = require('clone');
var createError = require('http-errors');
var bodyParser = require('body-parser');
var ids = require('../../lib/util/id');
var idmcore;
var saltrounds = 10;
var bcrypt = require('bcrypt');

function RouterApi(tokenConf, idmcore, router, strategies) {

  //enable cors
  var cors_wrapper = require('../cors_wrapper')(tokenConf);
  router.route('*').options(cors_wrapper);
  router.use("*", cors_wrapper);

  var stripped_strategies = strategies.map(function (value) {
    var n = value.lastIndexOf(".js");
    if (n > 0)
      return (value.substr(0, n));
  });

  var updatePasswordWithCheck = function (idmcore, auth_result, user_update_id, entity_type, old_password, new_password) {
    return new Promise(function (resolve, reject) {
      idmcore.readEntity(auth_result, user_update_id, entity_type)
        .then(function (user) {
          bcrypt.compare(old_password, user.password, function (err, result) {
            if (err || !result) {
              console.log("wrong password");
              reject(createError(403, "wrong password"));
            } else {
              bcrypt.hash(new_password, saltrounds, function (err, hash) {
                //for consistency in owner policy lock evaluation, users own themselves.
                idmcore.setEntityAttribute(auth_result, user_update_id, entity_type, "password", hash)
                  .then(function (read) {
                    resolve({
                      "result": "password updated"
                    });
                  }).catch(function (error) {
                    console.log("error when posting entity " + error);
                    reject(createError(error.statusCode || 500, error.message || "error when posting entity " + error));
                  });
              });
            }
          });
        }).catch(function (error) {
          console.log("error when changing password " + error);
          reject(createError(error.statusCode || 500, error.message || "error when posting entity " + error));
        });
    });
  }

  var updatePasswordWithoutCheck = function (idmcore, auth_result, user_update_id, entity_type, new_password) {
    return new Promise(function (resolve, reject) {
      idmcore.readEntity(auth_result, user_update_id, entity_type)
        .then(function (user) {
          bcrypt.hash(new_password, saltrounds, function (err, hash) {
            //for consistency in owner policy lock evaluation, users own themselves.
            idmcore.setEntityAttribute(auth_result, user_update_id, entity_type, "password", hash)
              .then(function (read) {
                resolve({
                  "result": "password updated"
                });
              }).catch(function (error) {
                console.log("error when posting entity " + error);
                reject(createError(error.statusCode || 500, error.message || "error when posting entity " + error));
              });
          });

        }).catch(function (error) {
          console.log("error when changing password " + error);
          reject(createError(error.statusCode || 500, error.message || "error when posting entity " + error));
        });
    });
  }
  //returns 400 if a field of the body is missing or if wrong authentication type is provided. returns 200 and the entity, or 401 or 403, in case of security issues, 422 in case a user is attempted to be created through this API, or 409 if entity already exists, 500 in case of unexpected situations
  //curl -H "Content-type: application/json" -H "Authorization: bearer HeTxINCpXD0U6g27D7AIxc2CvfFNaZ" -X POST -d '{"user_name":"a", "auth_type":"github"}' 'http://localhost:3000/api/v1/user'
  router.route('/user/').post(
    passport.authenticate('agile-bearer', {
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
        bcrypt.hash(user.password, saltrounds, function (err, hash) {
          user.password = hash;
          //for consistency in owner policy lock evaluation, users own themselves.
          idmcore.createEntityAndSetOwner(req.user, entity_id, entity_type, user, entity_id)
            .then(function (read) {
              res.json(read);
            }).catch(function (error) {
              console.log("error when posting entity " + error);
              res.statusCode = error.statusCode || 500;
              res.json({
                "error": error.message
              });
            });
        });

      }
    }
  );

  //returns 200 and the entity, or 401 or 403, in case of security issues, 400 in case there is not enough parameters. or 409 if entity already exists, 500 in case of unexpected situations
  //curl -H "Authorization: bearer ypr24DKllIbKlV3Ph8oWmZ7Pml3Wku" 'http://localhost:3000/api/v1/user/?user_name=bob&auth_type=agile-local'
  router.route('/user/').get(
    passport.authenticate('agile-bearer', {
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
          res.statusCode = error.statusCode || 500;
          res.json({
            "error": error.message
          });
        });

    });

  //returns 200 if the user is deleted, or 401 or 403, in case of security issues, 400 in case there is not enough parameters. or 409 if entity already exists, 500 in case of unexpected situations
  //curl -H "Authorization: bearer ypr24DKllIbKlV3Ph8oWmZ7Pml3Wku"  -X DELETE 'http://localhost:3000/api/v1/user/?user_name=bob&auth_type=agile-local'
  router.route('/user/').delete(
    passport.authenticate('agile-bearer', {
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
      idmcore.deleteEntity(req.user, ids.buildId(req.query.user_name, req.query.auth_type), entity_type)
        .then(function (read) {
          res.json(read);
        }).catch(function (error) {
          console.log("error when reading user " + error);
          res.statusCode = error.statusCode || 500;
          res.json({
            "error": error.message
          });
        });

    });

  //returns  or 401 or 403 if token is invalid or the old password doesn't match, 500 in case of unexpected situations
  //curl -H "Content-type: application/json" -H "Authorization: bearer $TOKEN" -X PUT -d '{"old_password":"a", "new_password":"secret22"}' 'http://localhost:3000/api/v1/user/password'  router.route('/user/password').put(
  router.route('/user/password').put(
    passport.authenticate('agile-bearer', {
      session: false
    }),
    bodyParser.json(),
    function (req, res) {
      if (!req.body.old_password || !req.body.new_password) {
        res.statusCode = 400;
        return res.json({
          "error": "provide old_password and new_password"
        });
      } else {

        var user = req.body;
        var entity_type = "/user";
        var user_update_id = req.user.id;
        var auth_result = req.user;
        updatePasswordWithCheck(idmcore, auth_result, user_update_id, entity_type, req.body.old_password, req.body.new_password)
          .then(function (result) {
            res.statusCode = 200;
            res.json(result || {
              "result": "password updated"
            });
          }).catch(function (error) {
            console.log("error when updating user's password " + error);
            res.statusCode = error.statusCode || 500;
            res.json({
              "error": error.message
            });
          });
      }
    }
  );

  // this call is only possible if the user can write to the password attribute (by default only admins can do that.)
  //returns  or 401 or 403 if token is invalid or the old password doesn't match, 500 in case of unexpected situations
  //curl -H "Content-type: application/json" -H "Authorization: bearer $TOKEN" -X PUT -d '{ "new_password":"secret22"}' 'http://localhost:3000/api/v1/user/alice!@!agile-secret/password'
  router.route('/user/:user_update_id/password').put(
    passport.authenticate('agile-bearer', {
      session: false
    }),
    bodyParser.json(),
    function (req, res) {
      if (!req.body.new_password) {
        res.statusCode = 400;
        return res.json({
          "error": "provide new_password"
        });
      } else {
        var user = req.body;
        var entity_type = "/user";
        var user_update_id = req.params.user_update_id;
        var auth_result = req.user;
        updatePasswordWithoutCheck(idmcore, auth_result, user_update_id, entity_type, req.body.old_password, req.body.new_password)
          .then(function (result) {
            res.statusCode = 200;
            res.json(result || {
              "result": "password updated"
            });
          }).catch(function (error) {
            console.log("error when updating user's password " + error);
            res.statusCode = error.statusCode || 500;
            res.json({
              "error": error.message
            });
          });
      }
    }
  );
}
module.exports = RouterApi;

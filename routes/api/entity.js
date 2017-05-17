var passport = require('passport');
var express = require('express');
var clone = require('clone');
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
  // curl -H "Authorization: bearer $TOKEN" 'http://localhost:3000/api/v1/entity/user/
  //returns entity with 200 if OK, else, it can return an empty array if no entity is not found, 401 or 403 in case of security errors or 500 in case of unexpected situations
  router.route('/entity/:entity_type/').get(
    passport.authenticate('agile-bearer', {
      session: false
    }),
    function (req, res) {
      var entity_type = "/" + req.params.entity_type;
      idmcore.listEntitiesByEntityType(req.user, entity_type)
        .then(function (read) {
          res.json(read);
        }).catch(function (error) {
          res.statusCode = error.statusCode || 500;
          res.json({
            "error": error.message
          });
        });

    }
  );

  //example to call tthis one
  // curl -H "Authorization: bearer nNGNryDDZ4zQYeWYGYcnOdxJ90k9s6" 'http://localhost:3000/api/v1/entity/user/bob!@!agile-local'
  //returns entity with 200 if OK, else, it can return 404 if the entity is not found, 401 or 403 in case of security errors or 500 in case of unexpected situations
  router.route('/entity/:entity_type/:entity_id').get(
    passport.authenticate('agile-bearer', {
      session: false
    }),
    function (req, res) {
      var entity_type = "/" + req.params.entity_type;
      var entity_id = req.params.entity_id;
      idmcore.readEntity(req.user, entity_id, entity_type)
        .then(function (read) {
          res.json(read);
        }).catch(function (error) {
          res.statusCode = error.statusCode || 500;
          res.json({
            "error": error.message
          });
        });

    }
  );
  //returns 200 and the entity, or 401 or 403, in case of security issues, 422 in case a user is attempted to be created through this API, or 409 if entity already exists, 500 in case of unexpected situations
  //curl -H "Content-type: application/json" -H "Authorization: bearer HeTxINCpXD0U6g27D7AIxc2CvfFNaZ" -X POST -d '{"name":"my BLE thingy"}' 'http://localhost:3000/api/v1/entity/sensor/1'
  // curl -X POST -H "Content-type: application/json" -H "Authorization: bearer sDRzowStzB4W0KC57fhUXeX0edhfVE" -d '{"name":"two2","credentials":[{"sytem":"dropbox","value":"xyzsometoken"}]}' 'http://localhost:3000/api/v1/entity/sensor/2'

  router.route('/entity/:entity_type/:entity_id').post(
    passport.authenticate('agile-bearer', {
      session: false
    }),
    bodyParser.json(),
    function (req, res) {
      var entity = req.body;
      var entity_type = "/" + req.params.entity_type;
      var entity_id = req.params.entity_id;
      if (entity_type === "/user") {
        //we enforce this to make sure that ids are consistent with auth type and all...
        //reading is fine in both endpoints though.
        res.statusCode = 422;
        res.json({
          "error": "to create users call the endpoint in /api/v1/users/"
        });
      } else {
        idmcore.createEntity(req.user, entity_id, entity_type, entity)
          .then(function (read) {
            res.json(read);
          }).catch(function (error) {
            console.log("error when posting entity " + error);
            res.statusCode = error.statusCode || 500;
            res.json({
              "error": error.message
            });
          });
      }
    }
  );

  //example to call tthis one
  // curl -H "Authorization: bearer nNGNryDDZ4zQYeWYGYcnOdxJ90k9s6" -X DELETE 'http://localhost:3000/api/v1/entity/sensor/1'
  //returns entity with 200 if OK, else, it can return 404 if the entity is not found, 401 or 403 in case of security errors or 500 in case of unexpected situations
  router.route('/entity/:entity_type/:entity_id').delete(
    passport.authenticate('agile-bearer', {
      session: false
    }),
    function (req, res) {
      var entity_type = "/" + req.params.entity_type;
      var entity_id = req.params.entity_id;
      idmcore.deleteEntity(req.user, entity_id, entity_type)
        .then(function (read) {
          res.json(read);
        }).catch(function (error) {
          res.statusCode = error.statusCode || 500;
          res.json({
            "error": error.message
          });
        });

    }
  );

  //returns 200 and the entity, or 401 or 403, in case of security issues, 422 in case a user is attempted to be created through this API, or 409 if entity already exists, 500 in case of unexpected situations
  //curl -H "Content-type: application/json" -H "Authorization: bearer HeTxINCpXD0U6g27D7AIxc2CvfFNaZ" -X DELETE 'http://localhost:3000/api/v1/entity/sensor/1/attribute/name'
  router.route('/entity/:entity_type/:entity_id/attribute/:attribute_name').delete(
    passport.authenticate('agile-bearer', {
      session: false
    }),
    bodyParser.json(),
    function (req, res) {
      var entity_type = "/" + req.params.entity_type;
      var entity_id = req.params.entity_id;

      idmcore.deleteEntityAttribute(req.user, entity_id, entity_type, req.params.attribute_name)
        .then(function (read) {
          res.json(read);
        }).catch(function (error) {
          console.log("error when updating  entity attribute " + error);
          res.statusCode = error.statusCode || 500;
          res.json({
            "error": error.message
          });
        });

    }
  );

  router.route('/entity/:entity_type/:entity_id/attribute/:attribute_name').put(
    passport.authenticate('agile-bearer', {
      session: false
    }),
    bodyParser.json(),
    function (req, res) {
      var entity = req.body;
      var entity_type = "/" + req.params.entity_type;
      var entity_id = req.params.entity_id;
      if (!req.body.value) {
        res.statusCode = 400;
        res.json({
          "error": "provide value in the body"
        });
      } else {
        idmcore.setEntityAttribute(req.user, entity_id, entity_type, req.params.attribute_name, req.body.value)
          .then(function (read) {
            res.json(read);
          }).catch(function (error) {
            console.log("error when updating  entity attribute " + error);
            res.statusCode = error.statusCode || 500;
            res.json({
              "error": error.message
            });
          });
      }

    }
  );

  /*
      Query for entity attribute and types
  */

  //returns 200 and the entity, or 401 or 403, in case of security issues, 422 in case a user is attempted to be created through this API, or 409 if entity already exists, 500 in case of unexpected situations
  //if no entities are found it returns an empty array and status code 200.
  //in the body the critieria specifying attribute type and value must be provided, it is an array of any size >1
  //curl -H "Content-type: application/json" -H "Authorization: bearer 67LwTkbmAYEVHrNUzWCslonPK2VDGj"  -X POST -d '{"criteria":[{"attribute_type":"owner", "attribute_value":"bob!@!agile-local"},{"attribute_type":"name","attribute_value":"Example Consumer App"}]}' 'http://localhost:3000/api/v1/entity/search'
  router.route('/entity/search/').post(
    passport.authenticate('agile-bearer', {
      session: false
    }),
    bodyParser.json(),
    function (req, res) {
      if (!req.body.criteria) {
        res.statusCode = 400;
        res.json({
          "error": "pass an array of objects with attribute_type and attribute_value strings in the criteria field of the body"
        });
      } else {
        idmcore.listEntitiesByAttributeValueAndType(req.user, req.body.criteria)
          .then(function (read) {
            res.json(read);
          }).catch(function (error) {
            console.log("error when searching by attribute values and types " + error);
            res.statusCode = error.statusCode || 500;
            res.json({
              "error": error.message
            });
          });
      }
    });

  return router;
}
module.exports = RouterApi;

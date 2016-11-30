var cors = require('cors');
var passport = require('passport');
var express = require('express');
var clone = require('clone');
var IdmCore = require('agile-idm-core');
var bodyParser = require('body-parser');
var idmcore;

function RouterApi(conf) {
  var idmcore = new IdmCore(conf);
  var router = express.Router();

  //example to call tthis one
  // curl -H "Authorization: bearer nNGNryDDZ4zQYeWYGYcnOdxJ90k9s6" 'http://localhost:3000/api/entity/User/bob!@!agile-local'
  router.route('/entity/:entity_type/:entity_id').get(
    cors(),
    passport.authenticate('bearer', {
      session: false
    }),
    function (req, res) {
      var entity_type = "/"+req.params.entity_type;
      var entity_id =  req.params.entity_id;
      idmcore.readEntity(req.user,entity_id, entity_type)
       .then(function (read) {
         res.json(read);
       }).catch(function (error) {
         res.statusCode = error.statusCode;
         res.json(error);
       });
    }
  );
 // curl -H "Content-type: application/json" -H "Authorization: bearer nNGNryDDZ4zQYeWYGYcnOdxJ90k9s6" -u "{'user_name':'bob', 'auth_type':'agile-local'}" 'http://localhost:3000/api/entity/User/bob!@!agile-local'

 router.route('/entity/:entity_type/:entity_id').post(
   cors(),
   bodyParser.json(),
   passport.authenticate('bearer', {
     session: false
   }),
   function (req, res) {
     var user = req.body;
     var entity_type = "/"+req.params.entity_type;
     var entity_id =  req.params.entity_id;
     console.log("body "+JSON.stringify(user));
     idmcore.createEntity(req.user,entity_id, entity_type,user)
      .then(function (read) {
        res.json(read);
      }).catch(function (error) {
        console.log("error when posting entity "+error);
        res.statusCode = error.statusCode;
        res.json(error);
      });
   }
 );
 return router;
}
module.exports = RouterApi;

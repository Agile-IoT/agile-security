var cors = require('cors');
var passport = require('passport');
var express = require('express');
var clone = require('clone');
var IdmCore = require('agile-idm-core');

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
      console.log(req.params);
      var entity_type = "/"+req.params.entity_type;
      var entity_id =  req.params.entity_id;
      idmcore.readEntity(req.user,entity_id, entity_type)
       .then(function (read) {
         res.json(read);
       }).catch(function (error) {
         res.statusCode = error.statusCode;
         res.json(error);
       });

      //tell who the user is... remove tokens maybe later?
      /*if (req.user) {
        var user = clone(req.user);
        res.json(user);
      } else {
        res.status(401).json({
          "error": "not authenticated"
        })
      }*/

    }
  );
  return router;
}
module.exports = RouterApi;

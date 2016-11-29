var passport = require('passport');
var express = require('express');

function RouterPassport(router) {

  //Local
  router.route('/agile-local').get(function(req, res) {
    var options = [{ "name":"username",
                     "type":"text",
                     "label":"username"
                    },
                    { "name":"password",
                      "type":"password",
                      "label":"password"
                    }
                  ];
    res.render('local',{auth_type:'agile-local',fields:options});
  });
  router.route('/agile-local').post(
     passport.authenticate('agile-local'/*'github'*/, { successReturnToOrRedirect: '/', failureRedirect: '/login', failureFlash: true  })
  );
  return router;
}
module.exports = RouterPassport;

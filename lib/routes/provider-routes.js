
var passport = require('passport');
var express = require('express');

function RouterPassport(conf, app){


  var failUrl = conf["auth"]["response"]["fail"]["url"];
  var successUrl = conf["auth"]["response"]["success"]["url"];

  var router = express.Router();

  function redirectToConfig(config, req,res){
        console.log(JSON.stringify(config));
        //TODO check if token should be as query param
        var url = config.url;
        if(config["token"] && req.user.token){
          if(config["token"]=="query-params")
            url = url+"?token="+ encodeURIComponent(req.user.token);
        }
        return res.redirect(url);
  }

  function handleRedirect(routeType, req,res){
    console.log("session id"+req.session.id);
    console.log("session cookie"+JSON.stringify(req.session.cookie));
    if(conf["auth"][routeType] && conf["auth"][routeType]["response"]&& conf["auth"][routeType]["response"]["success"] && conf["auth"][routeType]["response"]["success"]["url"])
      return redirectToConfig(conf["auth"][routeType]["response"]["success"],req,res);
    else
      return redirectToConfig(conf["auth"]["response"]["success"],req,res);

  }

    //local strategy (REST API JSON)
  router.route('/local').post(
    passport.authenticate('agile-local',{ failureRedirect: failUrl,
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true

      }),
      handleRedirect.bind(this,"local")
  );

  //Github
  router.route('/github').get(
    passport.authenticate('github'),
    function(req, res){}
  );

  router.route('/callback_github').get(
    passport.authenticate('github', { failureRedirect: failUrl }),
        handleRedirect.bind(this,"github")
  );

  //Google
  router.route('/google').get(
    passport.authenticate('google', {  }
  ));
  //TODO place into router later! Fix README first!
  app.get/*router.route*/('/callback_google'/*).get(*/,
    passport.authenticate('google', { failureRedirect: failUrl }),
        handleRedirect.bind(this,"google")
    );

  router.route('/web_id').get(
     //TODO adjust to show errors with express properly. check example in the webid passport (Agile-IoT) it handles errors with ejs and failureFlash true
     passport.authenticate('webid', { failureRedirect: failUrl,  passReqToCallback: true, failureFlash: false   }),
        handleRedirect.bind(this,"webid")
    );

  return router;

}
module.exports = RouterPassport;

var passport = require('passport');
var GithubStrategy = require('passport-github2').Strategy;
var conf = require('../../conf/agile-ui-conf');
var connectionPoolPromisse = require('../token-connection-pool');
var TokenAuthentication = require("../../../agile-idm-commons/authentication.js")

connectionPoolPromisse.then(function(storage){
  //strategy :)
  passport.use(new GithubStrategy({
    clientID: conf.auth.github.clientID,
    clientSecret: conf.auth.github.clientSecret,
    callbackURL: conf.auth.github.redirect_path,
    scope: conf.auth.google.scope
    },
    function(accessToken, refreshToken, profile, done) {
      storage.getTokenByUserId(profile.id,function(result){
          if(result.success){
                  console.log("result from deserialize data"+ JSON.stringify(result.data));
                  done(null, result.data);
        }
        else {
          //console.log(JSON.stringify(profile));
          var cookie_id=Math.random().toString();
         cookie_id=cookie_id.substring(2,cookie_id.length);
          var id=Math.random().toString();
         id=cookie_id.substring(2,cookie_id.length);
          token={};
          token["user_id"]= profile.username;
          //TODO fix date ... it doesn't expire
          token["expiration"]= null;
          token["scope"]=JSON.stringify(conf.auth.github.scope);
          token["token_type"] = "bearer";
          token["auth_type"] = "github";
          token['token'] = accessToken;

          //console.log('cookie '+cookie_id)
          //console.log('id '+id)
          storage.storeToken(id, cookie_id, "github",token,function(result){
             if(result.hasOwnProperty("success") &&  result.success){
              console.log('github token stored '+ id)
              token.id = token["user_id"];
              console.log('github user returned  '+ JSON.stringify(token));

               return done(null,token);
             }
             else{
                console.log('cannot store token '+JSON.stringify(result));
                return done(result.error);

             }
          });
        }
      });
    }
  ));

}, function(error){
    console.log('cannot load database error'+JSON.stringify(error));
})

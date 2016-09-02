var passport = require('passport');
var GithubStrategy = require('passport-github2').Strategy;
var conf = require('../../conf/agile-ui-conf');
var connectionPoolPromisse = require('../token-connection-pool');
var tokens = require('../../util/token-generator');

connectionPoolPromisse.then(function(storage){
  //strategy :)
  try{
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
              var cookie_id=tokens.generateCookie();
              var id=tokens.generateId();
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
                  console.log('github user returned  '+ JSON.stringify(token));

                   return done(null,token);
                 }
                 else{
                    console.log('cannot store token '+JSON.stringify(result));
                    return done(null, false,   {message: result.error});

                 }
              });
            }
          });
        }
      ));
      console.log('finished registering passport github strategy');

  }catch(e){
    console.log('FAIL TO register a strategy');
    console.error("ERROR: error loading passport strategy: "+e);
  }
}, function(error){
    console.log('cannot load database error'+JSON.stringify(error));
})

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth2').Strategy;
const  fs = require('fs');
var dateUtils = require('../../util/date');
var connectionPoolPromisse = require('../token-connection-pool');

var TokenAuthentication = require("../../../agile-idm-commons/authentication.js")


connectionPoolPromisse.then(function(storage){

  passport.use(new GoogleStrategy({
    clientID: conf.auth.google.clientID,
    clientSecret: conf.auth.google.clientSecret,
    callbackURL: conf.auth.google["redirect_path"],
    scope: conf.auth.google.scope,
    passReqToCallback   : false
    },
    function(/*request,*/  accessToken, refreshToken, tokenObject, profile, done) {

        storage.getTokenByUserId(profile.id,function(result){
            if(result.success){
                    result.data._id = result.data.userId;
                    console.log("result from deserialize data"+ JSON.stringify(result.data));
                    done(null, result.data);
          }
          else {

            //console.log(JSON.stringify(accessToken));
            var cookie_id=Math.random().toString();
           cookie_id=cookie_id.substring(2,cookie_id.length);
            var id=Math.random().toString();
           id=cookie_id.substring(2,cookie_id.length);
            token={};
            token["user_id"]= profile.email;
            var exp = 1200;
            if(tokenObject.hasOwnProperty("expires_in"))
                  exp  =  (tokenObject["expires_in"]);

            token["expiration"]= dateUtils.sqliteDateNowPlusSeconds(exp);
            token["scope"]=JSON.stringify(conf.auth.google.scope);
            token["token_type"] = "bearer";
            token["auth_type"] = profile.provider
            token['token'] = tokenObject["access_token"];
            if(refreshToken)
              token["refresh_token"] = refreshToken;
            //NOTE. id_token is also available...
            storage.storeToken(id, cookie_id, profile.provider, token,function(result){
               if(result.hasOwnProperty("success")  && result.success){
                console.log('google token stored '+ id)
                token.id = token["user_id"];
                console.log('google user returned  '+ JSON.stringify(token));
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

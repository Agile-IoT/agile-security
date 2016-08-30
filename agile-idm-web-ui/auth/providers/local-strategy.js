var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const  fs = require('fs');
var dateUtils = require('../../util/date');
var connectionPoolPromisse = require('../token-connection-pool');
var conf = require('../../conf/agile-ui-conf');
var tokens = require('../../util/token-generator');
var user = null;
var pam = null;

//attempt to load pam... if not use fallback user...
try {
    require.resolve('authenticate-pam');
    pam = require('authenticate-pam');

} catch(e) {
     user = require('../../conf/fallback-user-no-pam');
    console.error("Running without PAM authentication... using default file in ");

}

function setToken(storage, username, auth_type, done){
      var cookie_id=tokens.generateCookie();
      var id=tokens.generateId();
      var accessToken = tokens.generateToken();
      var token = {};
      token["token"]=accessToken;
      token["scope"]=JSON.stringify([conf["gateway_id"]]);
      token["token_type"]="agile_unix_pam";
      token["auth_type"] = auth_type;
      token["user_id"] = username;

      storage.storeToken(id, cookie_id,token["auth_type"], token,function(result){
         if(result.hasOwnProperty("success")  && result.success){
            console.log(auth_type+' token stored '+ id)
            return done(null,token);
         }
         else{
            console.log('cannot store token '+JSON.stringify(result));
            return done(result.error);

         }
      });
}

connectionPoolPromisse.then(function(storage){
  try{
          passport.use(new LocalStrategy(
              function(username, password, done) {
                  if (!username || !password) {
                    return done(null, false);
                  }
                  else if(pam != null){
                     pam.authenticate(username, password,function(err){
                        if(err)   return done(err);
                        else setToken(storage, username, "unix_pam", done);
                     });
                  }
                  else{
                    if (password == user.password && username == user.username){
                        setToken(storage, username, "fallback_user_no_pam", done);
                    }
                    else{
                        return done(null, false);
                    }
                  }

              }
          ));
          console.log('finished registering passport local strategy')
    }catch(e){
      console.log('FAIL TO register a strategy');
      console.error("ERROR: error loading passport strategy: "+e);
    }


  }, function(error){
        console.log('cannot load database error'+JSON.stringify(error));
  })

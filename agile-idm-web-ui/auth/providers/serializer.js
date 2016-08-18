var passport = require('passport');
var connectionPoolPromisse = require('../token-connection-pool');


connectionPoolPromisse.then(function(storage){
    console.log('setting up seralizer');
    passport.serializeUser(function(user, done) {
      console.log('serializeUser: ' + JSON.stringify(user));
      done(null, user["user_id"]);
    });
    passport.deserializeUser(function(id, done) {
      storage.getTokenByUserId(id,function(result){
          if(result.hasOwnProperty("success") && result.success){
                  console.log("result from deserialize data"+ JSON.stringify(result.data));
                  done(null, result.data);

         }else done(err, null);
        });
    });
}, function(error){
      console.log('cannot load database error'+JSON.stringify(error));
})

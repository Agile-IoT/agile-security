var passport = require('passport');
var BearerStrategy = require('passport-http-bearer').Strategy;
var connectionPoolPromisse = require('../token-connection-pool');


connectionPoolPromisse.then(function(storage){

     passport.use(new BearerStrategy(
      function(token, done) {
        storage.getTokenByToken(token, function(result){
          if(result.hasOwnProperty("success") &&  result.success){
             return done(null, result.data);
          }
          else{
             console.log('cannot store token '+JSON.stringify(result));
             return done(result.error);
          }

        });
      }
    ));
}, function(error){
      console.log('cannot load database error'+JSON.stringify(error));
})

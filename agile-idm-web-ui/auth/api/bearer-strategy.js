var passport = require('passport');
var BearerStrategy = require('passport-http-bearer').Strategy;
var connectionPoolPromisse = require('../token-connection-pool');


connectionPoolPromisse.then(function(storage){
 try{
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
      console.log('finished registering passport bearer strategy');

  }catch(e){
    console.log('FAIL TO register a strategy');
    console.error("ERROR: error loading passport strategy: "+e);
  }
}, function(error){
      console.log('cannot load database error'+JSON.stringify(error));
})

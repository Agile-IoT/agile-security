//https://developer.github.com/v3/oauth/#check-an-authorization
//https://github.com/lelylan/simple-oauth2
const  request  = require('request');
const connectionPool = require('./token-connection-pool');
/* conf needs to have at least:

  clientID: client id for access code authorization flow
  clientSecret: client secret for auth flow
  site: where to redirect the user for log in
  tokenPath: path to exchange code for token

  host_name: scheme and name (or IP) of the gateway
  redirect_path: path to get the auth code
  scope: scope for authorization
  initial_path: path for the initial request. the one that will redirect to the IdP

  EVERY PATH STARTS WITH / AND HOSTNAMES DO NOT INCLUDE /





*/
function GithubOauth2(app, conf, storage){

  app.get('/github',
    passport.authenticate('github'),
    function(req, res){
      res.send('a');
  });
  app.get('/callback_github',
    passport.authenticate('github', { failureRedirect: '/' }),
    function(req, res) {
      console.log("session id"+req.session.id);
      console.log("session cookie"+JSON.stringify(req.session.cookie));
      res.redirect('/account');
  });


  passport.use( new GithubStrategy({
                  clientID: conf["auth"]["github"].clientID,
                  clientSecret: conf["auth"]["github"].clientSecret,
                  callbackURL: config["auth"]["github"].redirect_path
                },
                function(accessToken, refreshToken, profile, done) {
                      connectionPool(function(storage){
                           storage.getTokenByUserId(profile.id,function(result){
                               if(result.success){
                                      //result.data._id = result.data.userId;
                                      console.log("result from deserialize data"+ JSON.stringify(result.data));
                                      done(null, result.data["userId"]+result.data["auth_type"]);
                               }
                               else {
                                   console.log(profile)
                                   //console.log(JSON.stringify(profile));
                                  console.log(JSON.stringify(profile));
                                  var cookie_id=Math.random().toString();
                                  cookie_id=cookie_id.substring(2,cookie_id.length);
                                  token={};
                                  token["user_id"]= profile.username;
                                  token["expiration"]= "2016-07-12 16:46:37";
                                  token["scope"]="github";
                                  token["token_type"] = "bearer";
                                  token["auth_type"] = "github";
                                  //token["user_id"]= profile.id;
                                  token['token'] = accessToken;
                                  storage.storeToken(cookie_id, "github",token,function(cookie_id, userId, result){
                                        if(result.success){
                                           console.log('token stored '+ userId)
                                           return done(null,token);
                                        }
                                        else{
                                           console.log('cannot store token '+JSON.stringify(result));
                                           return done(result.error);
                                       }
                                 }.bind(token));
                             }
                        });
                      }, conf['token-storage']);
                })
  );


};


          /*user = new User({
            oauthID: profile.id,
            token: accessToken,
            //profile: JSON.stringify(profile),
            name: profile.username,
            created: Date.now()
          });
          user.save(function(err) {
            if(err) {
              console.log(err);  // handle errors!
            } else {
              console.log("saving user ...");
              done(null, user);
            }
          });*/


  //  }
//  ));

module.exports = GithubOauth2;

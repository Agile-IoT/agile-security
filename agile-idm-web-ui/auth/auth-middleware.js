const GithubOauth2 = require('./oauth2-github.js');
//const DropboxOauth2 = require('./oauth2-dropbox.js');
const GoogleOauth2 = require('./oauth2-google.js');
const PamAuth = require('./pam-auth.js');
const WebID = require('./web-id.js');
const connectionPool = require('./token-connection-pool');
var passport = require('passport');

var bodyParser = require('body-parser');


function AuthetnticationMiddleware(app, conf){


  //passport serializater
connectionPoolPromisse.then(function(storage){

         passport.serializeUser(function(user, done) {
           console.log('serializeUser: ' + JSON.stringify(user));
           done(null, user.userId);
         });

         passport.deserializeUser(function(id, done) {

           storage.getTokenByUserId(id,function(result){
            result.data._id = result.data.userId;
            if(result.success){
                    console.log("result from deserialize data"+ JSON.stringify(result.data));
                    done(null, result.data);

           }else done(err, null);
          });
        });

        //strategies or also custom middleware
        var gh = new GithubOauth2(app, conf, storage);
        //var google = new GoogleOauth2(app, conf["auth"]["google"], storage);
        //var pam_auth = new PamAuth(app, conf["auth"]["pam"], storage);
        //var webID = new WebID(app, conf["auth"]["web-id"], storage);

  }, function(error){
        console.log('cannot load database error'+JSON.stringify(error));
  })

//create a cookie -> token storage and use it inside the different authentication modules.
//var app = express();





 //required by pam authentication interface
 //app.use(bodyParser.urlencoded({ extended: false }));
 //app.use(bodyParser.json());

 //var dauth = new DropboxOauth2(app, conf["auth"]["dropbox"], this.storage);

}

module.exports = AuthetnticationMiddleware;

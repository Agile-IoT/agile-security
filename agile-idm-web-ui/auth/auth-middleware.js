//https://developer.github.com/v3/oauth/#check-an-authorization
//https://github.com/lelylan/simple-oauth2




//Google stuff
//https://developers.google.com/identity/protocols/OAuth2#basicsteps
//https://developers.google.com/identity/protocols/OAuth2#serviceaccount
//Google Oauth2 client
//https://developers.google.com/gmail/api/quickstart/nodejs#prerequisites

//Dropbox
//https://www.dropbox.com/developers/reference/oauth-guide

//Twitter
// https://dev.twitter.com/web/sign-in/implementing
//https://apps.twitter.com/

//GENERIC INFO on Oauth2!
//http://stackoverflow.com/questions/12296017/how-to-validate-an-oauth-2-0-access-token-for-a-resource-server
//
//



const GithubOauth2 = require('./oauth2-github.js');
//const DropboxOauth2 = require('./oauth2-dropbox.js');
const GoogleOauth2 = require('./oauth2-google.js');
const PamAuth = require('./pam-auth.js');
const WebID = require('./web-id.js');
const connectionPool = require('./token-connection-pool');

var bodyParser = require('body-parser');

function Oauth2(app, conf){

   connectionPool(function(storage){
     var gh = new GithubOauth2(app, conf["auth"]["github"], storage);
     var google = new GoogleOauth2(app, conf["auth"]["google"], storage);
     var pam_auth = new PamAuth(app, conf["auth"]["pam"], storage);
     var webID = new WebID(app, conf["auth"]["web-id"], storage);
   }, conf['token-storage']);
//create a cookie -> token storage and use it inside the different authentication modules.
//var app = express();





 //required by pam authentication interface
 //app.use(bodyParser.urlencoded({ extended: false }));
 //app.use(bodyParser.json());

 //var dauth = new DropboxOauth2(app, conf["auth"]["dropbox"], this.storage);

}

module.exports = Oauth2;

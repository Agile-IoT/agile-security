var commandLineArgs = require('command-line-args');
var getUsage = require('command-line-usage');
var Storage = require('agile-idm-entity-storage').Storage;
/*var optionDefinitions = [
  { name: 'verbose', alias: 'v', type: Boolean },
  { name: 'src', type: String, multiple: true, defaultOption: true },
  { name: 'timeout', alias: 't', type: Number }
]*/

var sections = [
  {
    header: 'AGILE IDM Oauth2 Client Setup Script',
    content: 'Creates [italic]{clients} for IDM. This script is meant to enable applications to rely on IDM for authentication. The configuration of authentication mechanisms supported by IDM, such as google and github Oauth2 should be in the agile-idm-ui configuration file'
  },
  {
    header: 'Client info',
    optionList: [
      {
        name: 'client',
        alias:'u',
        typeLabel: '[underline]{String}',
        description: 'client identifier (unique).'
      },
      {
        name: 'name',
        alias:'n',
        typeLabel: '[underline]{String}',
        description: 'Name for the client'
      },
      {
        name: 'secret',
        alias:'s',
        typeLabel: '[underline]{String}',
        description: 'Secret that the application will provide when exchanging an authorization code for an access token from IDM'
      },
      {
        name: 'owner',
        alias:'o',
        typeLabel: '[underline]{String}',
        description: 'username of the owner.'
      },
      {
        name: 'uri',
        alias:'i',
        typeLabel: '[underline]{String}',
        description: 'url of the client. This url is used by AGILE-IDM to forward the user with the authorization code (or token) after the user has been authenticated'
      },
      {
        name: 'auth_type (optional)',
        alias:'k',
        typeLabel: '[underline]{String}',
        description: 'authentication type for the owner. In the case of a local user created through the createUser.js scripts this value is "local". If no value is passed the default value used is "local"'
      }
    ]
  },
  {
     header: "Configuration info (optional)",
     optionList:[
       {
         name:"config",
         alias:"c",
         description:"location of the database. By default '../database_' executed relative to this script's path is used"
       }
     ]

  },
  {
    header: "Help",
    optionList:[
        {
          name: 'help',
          alias:'h',
          description: 'Print this usage guide.'
     }]
  }
];

var optionDefinitions = [
  { name: 'client', alias: 'u', type: String },
  { name: 'name', alias: 'n', type: String },
  { name: 'secret', alias: 's', type: String },
  { name: 'uri', alias: 'i', type: String },
  { name: 'owner', alias: 'o', type: String },
  { name: 'auth_type', alias: 'k', type: String },
  { name: 'config', alias: 'c', type: String },
  { name: 'help', alias: 'h', type: String },
];

function help(){
  console.log(getUsage(sections));
}

var args;
var auth_type = "local";
var entity_type = "/Client";
var owner_auth_type = "local";
var db_location = {"storage":{"dbName":"../database_"}};
try{
   args = commandLineArgs(optionDefinitions);
  if(args.hasOwnProperty("help"))
    help();
  else{
    if(args.client && args.secret && args.owner && args.name && args.uri){
      if(args.config)
        db_location.storage.dbName = args.config;
      if(args.owner_auth_type)
        owner_auth_type = args.owner_auth_type;
      var storage = new Storage(db_location);
      var client_id =  args.client;

      var client = {
        name : args.name,
        clientSecret : args.secret,
        redirectURI: args.uri
      };
      var owner_id = args.owner+"!@!"+owner_auth_type;
      storage.readEntity(owner_id,"/User").then(function(u){
          //u.owner is equivalent to its own id as a string since every user "owns" himself
          return storage.createEntity(client_id, entity_type, u.owner, client);
      })
      .then(function(result){
        console.log("SUCCESS: Client created "+JSON.stringify(result));
      }, function fail(err){
        console.warn("FAILURE: Client cannot be created "+err);
      });

    }
    else {
      help();
    }
  }
}
catch(err){
  console.log(err);
  console.log(getUsage(sections));
}

//node createClient.js --client=ward-steward-2 --name="Example Consumer App" --secret="something truly secret" --owner=bob --config=../example/oauth2orize-examples/database_ --auth_type=local --uri=http://localhost:3002/auth/example-oauth2orize/callback

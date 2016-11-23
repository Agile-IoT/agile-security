var commandLineArgs = require('command-line-args');
var getUsage = require('command-line-usage');
var Storage = require('agile-idm-entity-storage').Storage;


/*
Parameter descriptions
*/
var sections = [
  {
    header: 'AGILE IDM User Setup Script',
    content: 'Creates local [italic]{users} which are administrators for IDM. This script is meant to be used during bootstrap of AGILE IDM'
  },
  {
    header: 'User info',
    optionList: [
      {
        name: 'username',
        alias:'u',
        typeLabel: '[underline]{String}',
        description: 'username.'
      },
      {
        name: 'password',
        alias:'p',
        typeLabel: '[underline]{String}',
        description: 'Local password for this administrator'
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
  { name: 'username', alias: 'u', type: String },
  { name: 'password', alias: 'p', type: String },
  { name: 'config', alias: 'c', type: String },
  { name: 'help', alias: 'h', type: String },
];

function help(){
  console.log(getUsage(sections));
}
var args;
var config;
var auth_type = "local";
var entity_type = "/User";
var db_location = {"storage":{"dbName":"../database_"}};
try{
   args = commandLineArgs(optionDefinitions);
  if(args.hasOwnProperty("help"))
    help();
  else{
    if(args.username && args.password){
      if(args.config)
        db_location.storage.dbName = args.config;

      var storage = new Storage(db_location);
      var user_id =  args.username+"!@!"+auth_type;
      var storage_id = {
         id: user_id,
         entity_type: entity_type
      };

      var user = {
        user_name: args.username,
        auth_type : auth_type,
        password : args.password
      }
      storage.createEntity(user_id, entity_type, user_id, user).then(function(result){
        console.log("SUCCESS: User created "+JSON.stringify(result));
      }, function fail(err){
        console.warn("FAILURE: User cannot be created "+err);
      });

    }
    else {
      help();
    }
  }
}
catch(err){
  console.log(getUsage(sections));
}

//node createUser.js --username=bob --password=secret --config=../example/oauth2orize-examples/database_

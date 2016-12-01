var commandLineArgs = require('command-line-args');
var getUsage = require('command-line-usage');
var Storage = require('agile-idm-entity-storage').Storage;
var ids = require('../lib/util/id');

/*
Examples of usage:
  To create a local user wit username bob and password secret:
  node createUser.js --username=bob --password=secret  --auth=agile-local
  To create a user wit username abc that will authenticate using github:
  node createUser.js --username=abc --auth=github
  node createUser.js --username=dp --auth=pam
  node createUser.js --username=https://dp.databox.me/profile/card#me --auth=webid


*/
var sections = [{
  header: 'AGILE IDM User Setup Script',
  content: 'Creates  [italic]{users} which are administrators for IDM. This script is meant to be used during bootstrap of AGILE IDM'
}, {
  header: 'User info',
  optionList: [{
      name: 'username',
      alias: 'u',
      typeLabel: '[underline]{String}',
      description: 'username.'
    }, {
      name: 'auth',
      alias: 'p',
      typeLabel: '[underline]{String}',
      description: 'this can be any authentication_type supported by AGILE-IDM. i.e.  "agile-local","github","google","webid"'
    }, {
      name: 'password (optional)',
      alias: 'p',
      typeLabel: '[underline]{String}',
      description: 'This argument is the password used for the user, and it MUST be passed when  auth is "agile-local".'
    }

  ]
}, {
  header: "Configuration info (optional)",
  optionList: [{
    name: "config",
    alias: "c",
    description: "location of the database. By default '../database_' executed relative to this script's path is used"
  }]
}, {
  header: "Help",
  optionList: [{
    name: 'help',
    alias: 'h',
    description: 'Print this usage guide.'
  }]
}];

var optionDefinitions = [{
  name: 'username',
  alias: 'u',
  type: String
}, {
  name: 'auth',
  alias: 'a',
  type: String
}, {
  name: 'password',
  alias: 'p',
  type: String
}, {
  name: 'config',
  alias: 'c',
  type: String
}, {
  name: 'help',
  alias: 'h',
  type: String
}, ];

function help(err) {
  if (err)
    console.log(err);
  console.log(getUsage(sections));
}
var args;
var config;

var entity_type = "/user";
var db_location = {
  "storage": {
    "dbName": "../database_"
  }
};
try {
  args = commandLineArgs(optionDefinitions);
  if (args.hasOwnProperty("help"))
    help();
  else {
    if (args.auth === "agile-local" && !args.password)
      return help(new Error("When local authentication is used a password is required!"));

    if (args.username && args.auth) {
      if (args.config)
        db_location.storage.dbName = args.config;

      var storage = new Storage(db_location);
      var user_id = ids.buildId(args.username, args.auth);
      var storage_id = {
        id: user_id,
        entity_type: entity_type
      };

      var user = {
        user_name: args.username,
        auth_type: args.auth

      }
      if (args.password) {
        user.password = args.password;
      }
      storage.createEntity(user_id, entity_type, user_id, user).then(function (result) {
        console.log("SUCCESS: User created " + JSON.stringify(result));
      }, function fail(err) {
        console.warn("FAILURE: User cannot be created " + err);
      });

    } else {
      help();
    }
  }
} catch (err) {
  help(err);

}

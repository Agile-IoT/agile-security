var commandLineArgs = require('command-line-args');
var getUsage = require('command-line-usage');
var IdmCore = require('agile-idm-core');

/*
Usage examples:
Creates a client called Example Comsumer App with secret.
node createClient.js --client=MyAgileClient2 --name="My first example as IDM client" --secret="Ultrasecretstuff" --owner=bob --auth_type=agile-local --uri=http://localhost:3002/auth/example/callback
node createClient.js --client=ward-steward-2 --name="Example Consumer App" --secret="something truly secret" --owner=bob --auth_type=agile-local --uri=http://localhost:3002/auth/example-oauth2orize/callback


Optionally one could add something like  --config=../example/oauth2orize-examples/database_   to store the entities in a different lcoation
*/

var sections = [{
  header: 'AGILE IDM Oauth2 Client Setup Script',
  content: 'Creates [italic]{clients} for IDM. This script is meant to enable applications to rely on IDM for authentication. The configuration of authentication mechanisms supported by IDM, such as google and github Oauth2 should be in the agile-idm-ui configuration file'
}, {
  header: 'Client info',
  optionList: [{
    name: 'client',
    alias: 'u',
    typeLabel: '[underline]{String}',
    description: 'client identifier (unique).'
  }, {
    name: 'name',
    alias: 'n',
    typeLabel: '[underline]{String}',
    description: 'Name for the client'
  }, {
    name: 'secret',
    alias: 's',
    typeLabel: '[underline]{String}',
    description: 'Secret that the application will provide when exchanging an authorization code for an access token from IDM'
  }, {
    name: 'owner',
    alias: 'o',
    typeLabel: '[underline]{String}',
    description: 'username of the owner.'
  }, {
    name: 'uri',
    alias: 'i',
    typeLabel: '[underline]{String}',
    description: 'url of the client. This url is used by AGILE-IDM to forward the user with the authorization code (or token) after the user has been authenticated'
  }, {
    name: 'auth_type (optional)',
    alias: 'k',
    typeLabel: '[underline]{String}',
    description: 'authentication type for the owner. In the case of a local user created through the createUser.js scripts this value is "agile-local". If no value is passed the default value used is "agile-local"'
  }]
}, {
  header: "Configuration info (optional)",
  optionList: [{
    name: "config",
    alias: "c",
    description: "location of the agile-idm-core configuration file. By default it takes the value from the configuration file in ../conf/agile-idm-core-conf.js, which should be '../database_' normally. This path is interpreted as relative to the parent folder"
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
  name: 'client',
  alias: 'u',
  type: String
}, {
  name: 'name',
  alias: 'n',
  type: String
}, {
  name: 'secret',
  alias: 's',
  type: String
}, {
  name: 'uri',
  alias: 'i',
  type: String
}, {
  name: 'owner',
  alias: 'o',
  type: String
}, {
  name: 'auth_type',
  alias: 'k',
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

var pepMockOk = {
  declassify: function (userInfo, entityInfo) {
    return new Promise(function (resolve, reject) {
      resolve(entityInfo);
    });
  },
  declassifyArray: function (userInfo, array) {
    return new Promise(function (resolve, reject) {
      resolve(array);
    });
  }
};

var PdpMockOk = {
  canRead: function (userInfo, entityInfo) {
    return new Promise(function (resolve, reject) {
      resolve(entityInfo);
    });
  },
  canDelete: function (userInfo, entityInfo) {
    return new Promise(function (resolve, reject) {
      resolve(entityInfo);
    });
  },
  canReadArray: function (userInfo, entities) {
    return new Promise(function (resolve, reject) {
      //console.log('resolving with entities '+JSON.stringify(entities));
      resolve(entities);
    });
  },
  canWriteToAttribute: function (userInfo, entities, attributeName, attributeValue) {
    return new Promise(function (resolve, reject) {
      //console.log('resolving with entities '+JSON.stringify(entities));
      resolve();
    });
  },
  canUpdate: function (userInfo, entityInfo) {
    return new Promise(function (resolve, reject) {
      //console.log('resolving with entities '+JSON.stringify(entities));
      resolve(entityInfo);
    });
  },
  canWriteToAllAttributes: function (userInfo, entityInfo) {
    return new Promise(function (resolve, reject) {
      //console.log('resolving with entities '+JSON.stringify(entities));
      resolve();
    });
  }

};

function help() {
  console.log(getUsage(sections));
}

var args;
var conf;
var entity_type = "/client";
try {

  var user = {
    user_name: "root",
    auth_type: "agile-local",
    role: "admin"
  };
  var client;
  args = commandLineArgs(optionDefinitions);
  if (args.hasOwnProperty("help"))
    help();
  else {
    if (args.config) {
      conf = require(args.config);
    } else {
      conf = require('../conf/agile-idm-core-conf');

    }
    //hack to execute relative to the upper directory
    if (conf.storage.dbName.indexOf("/") != 0) {
      conf.storage.dbName = "../" + conf.storage.dbName;
    }

    if (conf.upfront.pap.storage.dbName.indexOf("/") != 0) {
      conf.upfront.pap.storage.dbName = "../" + conf.upfront.pap.storage.dbName;
    }

    if (conf.upfront.pdp.ulocks.locks.indexOf("/") != 0) {
      conf.upfront.pdp.ulocks.locks = "../" + conf.upfront.pdp.ulocks.locks;
    }

    if (conf.upfront.pdp.ulocks.actions.indexOf("/") != 0) {
      conf.upfront.pdp.ulocks.actions = "../" + conf.upfront.pdp.ulocks.actions;
    }

    if (args.client && args.owner && args.name && args.uri) {
      if (args.auth_type) {
        user.auth_type = args.auth_type;
      }
      user.user_name = args.owner;
      user.id = user.user_name + "!@!" + user.auth_type;
      var client_id = args.client;

      var idmcore = new IdmCore(conf);
      //I know... this should be a callback...... fix this at some point
      setTimeout(function () {
        idmcore.setMocks(null, null, PdpMockOk, null, pepMockOk);
        idmcore.readEntity(user, user.id, "/user")
          .then(function (read) {
            user = read;
            client = {
              name: args.name,
              redirectURI: args.uri
            };
            if (args.secret) {
              client.clientSecret = args.secret;
            }
            return idmcore.createEntity(user, client_id, entity_type, client)
          }).then(function (created) {
            console.log("SUCCESS: Client created " + JSON.stringify(created));
          }, function handlereject(error) {
            console.warn("FAILURE: User cannot be created " + error);
          }).catch(function (err) {
            throw err;
          });
      }, 4000);

    } else {
      help();
    }

  }
} catch (err) {
  console.log(err);
  console.log(getUsage(sections));
}

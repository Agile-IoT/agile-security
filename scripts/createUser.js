var commandLineArgs = require('command-line-args');
var getUsage = require('command-line-usage');
var ids = require('../lib/util/id');
var IdmCore = require('agile-idm-core');
var bcrypt = require('bcrypt');
var saltrounds = 10;
/*
Examples of usage:
  To create a local user wit username bob and password secret:
  node createUser.js --username=bob --password=secret  --auth=agile-local --role=admin
  To create a user wit username abc that will authenticate using github:
  node createUser.js --username=abc --auth=github
  node createUser.js --username=dp --auth=pam
  node createUser.js --username=https://dp.databox.me/profile/card#me --auth=webid


*/
var sections = [{
  header: 'AGILE IDM User Setup Script (FOR ADMIN USERS MAINLY!!)',
  content: ' Creates  [italic]{users} which are administrators for IDM. This script is meant to be used during bootstrap of AGILE IDM [undeline]{Be careful when using this script. It bypasses security checks (to enable the creation of the first user) It is meant to create only admin users. Afterwards admin users can create other users}'
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
    }, {
      name: 'role (optional)',
      alias: 'r',
      typeLabel: '[underline]{String}',
      description: 'This argument specifies the role of the user, by default this is set to admin".'
    }

  ]
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
}, {
  name: 'role',
  alias: 'r',
  type: String
}];

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

function help(err) {
  if (err)
    console.log(err);
  console.log(getUsage(sections));
}
var args;
var conf;
var entity_type = "/user";

try {
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

    if (args.auth === "agile-local" && !args.password)
      return help(new Error("When local authentication is used a password is required!"));

    if (args.username && args.auth) {

      var user_id = ids.buildId(args.username, args.auth);
      var storage_id = {
        id: user_id,
        entity_type: entity_type
      };

      var user = {
        user_name: args.username,
        auth_type: args.auth,
        role: "admin"
      }
      if (args.role) {
        user.role = args.role;
      }
      if (args.password) {
        user.password = bcrypt.hashSync(args.password, saltrounds);
      }
      var idmcore = new IdmCore(conf);
      //I know... this should be a callback... fix this at some point
      setTimeout(function () {
        idmcore.setMocks(null, null, PdpMockOk, null, pepMockOk);
        console.log(JSON.stringify(user))
        console.log(JSON.stringify(user_id))
        console.log(JSON.stringify(entity_type))
        console.log(JSON.stringify(user_id))
        idmcore.createEntityAndSetOwner(user, user_id, entity_type, user, user_id).then(function (result) {

          console.log("SUCCESS: User created " + JSON.stringify(result));
        }, function fail(err) {
          console.warn("FAILURE: User cannot be created " + err);
        });

      }, 4000);

    } else {
      help();
    }
  }
} catch (err) {
  help(err);

}

var IdmCore = require('agile-idm-core');
var ids = require('./id');
var console = require('../log');

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

function createUser(conf, idmcore, callback) {
  var username = conf.configure_on_boot.user.username;
  var auth_type = conf.configure_on_boot.user.auth_type;
  var password = conf.configure_on_boot.user.password;
  var entity_type = "/user";
  var user_id = ids.buildId(username, auth_type);
  var storage_id = {
    id: user_id,
    entity_type: entity_type
  };
  var admin = {
    user_name: "root",
    auth_type: "agile-local",
    role: "admin"
  };
  var user = {
    user_name: username,
    auth_type: auth_type,
    role: "admin"
  };
  if (password) {
    user.password = password;
  }
  console.log(JSON.stringify(user));
  console.log(JSON.stringify(user_id));
  console.log(JSON.stringify(user_id));
  idmcore.createEntityAndSetOwner(admin, user_id, entity_type, user, user_id).then(function (result) {
    console.log("SUCCESS: User created ");
    callback();
  }, function fail(err) {
    if (error.statusCode !== 404)
      console.warn("FAILURE: User cannot be created " + err);
    callback();
  });
}

function createClient(conf, idmcore) {
  var username = conf.configure_on_boot.user.username;
  var auth_type = conf.configure_on_boot.user.auth_type;
  var password = conf.configure_on_boot.user.password;
  var entity_type = "/client";
  var user_id = ids.buildId(username, auth_type);
  var user = {
    user_name: "root",
    auth_type: "agile-local",
    role: "admin"
  };
  var client;
  idmcore.readEntity(user, user_id, "/user")
    .then(function (read) {
      user = read;
      client = {
        name: conf.configure_on_boot.client.name,
        redirectURI: conf.configure_on_boot.client.uri
      };
      if (conf.configure_on_boot.client.secret) {
        client.clientSecret = conf.configure_on_boot.client.secret;
      }
      return idmcore.createEntity(user, conf.configure_on_boot.client.id, entity_type, client);
    }).then(function (created) {
      console.log("SUCCESS: Client created ");
    }, function handlereject(error) {
      if (error.statusCode !== 404)
        console.warn("FAILURE: User cannot be created " + error + "this could");
    }).catch(function (err) {
      throw err;
    });
}

module.exports = function (conf) {
  console.log("checking if we need an initial setup " + conf.configure_on_boot);
  if (conf.configure_on_boot) {
    var idmcore = new IdmCore(conf);
    idmcore.setMocks(null, null, PdpMockOk, null, pepMockOk);
    if (conf.configure_on_boot.user) {
      createUser(conf, idmcore, function () {
        if (conf.configure_on_boot.client) {
          createClient(conf, idmcore);
        }
      });
    }

  }
};

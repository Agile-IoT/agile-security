var IdmCore = require('agile-idm-core');
var ids = require('./id');
var console = require('../log');
var bcrypt = require('bcrypt');
var saltrounds = 10;
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

function createEntity(idmcore, type, id, e, owner) {
  return new Promise(function (resolve, reject) {
    if (!owner) {
      console.log('something went wrong... no owner found. make sure that configure_on_boot contains at least one user');
      resolve();
    } else {
      var admin = {
        user_name: "root",
        auth_type: "agile-local",
        role: "admin"
      };
      idmcore.readEntity(admin, owner, "/user")
        .then(function (read) {
          user = read;
          return idmcore.createEntity(user, id, type, e);
        }).then(function (created) {
          console.log("SUCCESS: Entity of type " + type + " created ");
          resolve(created);
        }).catch(function (error) {
          console.log("FAILURE: Entity cannot be created " + error);
          resolve();
        });
    }
  });
}

function createUserInDB(idmcore, admin, user_id, entity_type, user, cb) {
  idmcore.createEntityAndSetOwner(admin, user_id, entity_type, user, user_id).then(function (r) {
    console.log("SUCCESS: User created " + user_id + " " + JSON.stringify(r));
    cb(r);
  }, function fail(err) {
    if (err.statusCode !== 404)
      console.log("FAILURE: User cannot be created " + err);
    cb();
  });
}

function createUser(idmcore, user) {
  return new Promise(function (resolve, reject) {
    //always resolve!
    var entity_type = "/user";
    var user_id = ids.buildId(user.user_name, user.auth_type);
    var admin = {
      user_name: "root",
      auth_type: "agile-local",
      role: "admin"
    };
    if (user.password) {
      bcrypt.hash(user.password, saltrounds, function (err, hash) {
        user.password = hash;
        createUserInDB(idmcore, admin, user_id, entity_type, user, function (d) {
          resolve(d);
        });
      });
    } else {
      createUserInDB(idmcore, admin, user_id, entity_type, user, function (d) {
        resolve(d);
      });
    }

  });
}

module.exports = function (conf) {
  console.log("checking if we need an initial setup " + conf.configure_on_boot);
  if (conf.configure_on_boot && conf.configure_on_boot.user) {
    var idmcore = new IdmCore(conf);
    idmcore.setMocks(null, null, PdpMockOk, null, pepMockOk);
    var owner;
    var type = 'user';
    //create user first and take first user as owner no matter what
    var ps = conf.configure_on_boot.user.map(function (u) {
      if (!owner) {
        owner = ids.buildId(u.user_name, u.auth_type);
      }
      return createUser(idmcore, u);
    });
    Promise.all(ps).then(function (r) {
      delete conf.configure_on_boot.user;
      console.log("results for creation of users" + JSON.stringify(r));
      var ps = [];
      Object.keys(conf.configure_on_boot).forEach(function (type) {
        ps = ps.concat(conf.configure_on_boot[type].map(function (e) {
          var id = e.id;
          delete e.id;
          return createEntity(idmcore, '/' + type, id, e, owner);
        }));
      });
      return Promise.all(ps);
    }).then(function (results) {
      console.log("results for creation of entities " + JSON.stringify(results));
    }).catch(function (error) {
      console.log("something went wrong during boot configuration " + error);
    });
  }
};

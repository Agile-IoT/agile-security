var Storage = require('agile-idm-entity-storage').Storage;
var client_entity_type = "/client";
var console = require('../log');

var findById = function (storage, id, done) {
  storage.readEntity(id, client_entity_type).then(function (result) {
    console.log('client found by id: ' + result.id + ' with redirectURI ' + result.redirectURI);
    result.clientID = result.id;
    return done(null, result);
  }, function er(error) {
    console.log('error while looking client by id!:  with id ' + id);
    if (error.statusCode.toString() === "404") {
      return done(null, null);
    } else {
      return done(error, null);
    }

  });
};

module.exports = function (conf) {
  var storage = new Storage(conf);
  return {
    findByClientId: findById.bind(this, storage)
  };
};

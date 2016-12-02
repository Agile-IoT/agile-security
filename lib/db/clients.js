var Storage = require('agile-idm-entity-storage').Storage;
var client_entity_type = "/client";
var console = require('../log');

var findById = function (storage, id, done) {
  storage.readEntity(id, client_entity_type).then(function (result) {
    console.log('client found by id: ' + result.id + ' with redirectURI ' + result.redirectURI);
    result.clientID = result.id;
    return done(null, result);
  }, function er(error) {
    console.log('client not found by id!:  with id ' + id);
    return done(error, null);
  });
};

module.exports = function (conf) {
  var storage = new Storage(conf);
  return {
    findByClientId: findById.bind(this, storage)
  };
};

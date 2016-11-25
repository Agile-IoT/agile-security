var Storage = require('agile-idm-entity-storage').Storage;
var user_entity_type = "/User";
var console = require('../log');
var createError = require('http-errors');

//id is a string...
var find = function (storage, entity_id, done) {
  storage.readEntity(entity_id, user_entity_type).then(function (result) {
    console.log('user found by user id ' + entity_id + '  and id ' + result.id);
    return done(null, result);
  }, function er(error) {
    if(error.statusCode === 404)
      return done(null, null);
    console.log('user not found by id!:  with id ' + entity_id);
    return done(error, null);
  });

};
var findByUsernameAndAuthType = function (storage, username, auth_type, done) {
  storage.listEntitiesByAttributeValueAndType([{
      attribute_type: "user_name",
      attribute_value: username
    }, {
      attribute_type: "auth_type",
      attribute_value: auth_type
    }], user_entity_type)
    .then(function (result) {
      if (result.length > 0) {
        console.log('user found by username ' + username + ' and auth_type ' + auth_type + ' : and id' + result[0].id);
        return done(null, result[0]);
      } else {
        var error = createError(404, " user not found ");
        return done(error, null);
      }
    });
};

module.exports = function (conf) {
  var storage = new Storage(conf);
  return {
    findByUsernameAndAuthType: findByUsernameAndAuthType.bind(this, storage),
    find: find.bind(this, storage)
  };
};

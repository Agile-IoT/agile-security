var Storage = require('agile-idm-entity-storage').Storage;
var user_entity_type = "/User";


//id is a string...
var find = function(storage, entity_id, done) {
 storage.readEntity(entity_id, user_entity_type).then(function(result){
        console.log('user found!: '+JSON.stringify(result));
        return done(null,result);
 }, function er(error){
   console.log('user not found by id!:  with id '+entity_id);
   return done(error, null);
 });


};
var findByUsernameAndAuthType = function(storage, username,auth_type, done) {
  storage.listEntitiesByAttributeValueAndType([{
      attribute_type: "user_name",
      attribute_value: username
    },
    {
      attribute_type: "auth_type",
      attribute_value: auth_type
    }], user_entity_type)
    .then(function(result){
      if( result.length > 0){
        console.log('user found!: '+JSON.stringify(result[0]));
        return done(null, result[0]);
      }
      else {
        console.log('error while  looking by username '+error);
        return done(error, null);
      }
    });
};

module.exports = function(conf){
  var storage = new Storage(conf);
  return {
    findByUsernameAndAuthType: findByUsernameAndAuthType.bind(this,storage),
    find: find.bind(this,storage)
  };
};

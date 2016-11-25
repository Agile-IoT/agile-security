module.exports = function (tokenconf, entityStorageConf) {
  return {
    users: require('./users')(entityStorageConf),
    clients: require('./clients')(entityStorageConf),
    accessTokens: require('./accesstokens')(tokenconf),
    authorizationCodes: require('./authorizationcodes')
  };

};

var IdmCore = require('../index');
var clone = require('clone');
var assert = require('assert');
var deepdif = require('deep-diff');
var fs = require('fs');
var conf = require('../rpi-conf/agile-ui-conf')
var connectionPoolPromisse = require('../lib/db/level/token-connection-pool');

var db;
//conf for the API (components such as storage and authentication for the API may be replaced during tests)
var dbName = "./database_";
//var rmdir = require('rmdir');
// var conf = {
//
//   "dbName": dbName
// };
const exampleToken = {
  "userID": "agile!@!agile-local",
  "clientId": "tester",
  "expiration": null,
  "scope": "password-token-scope",
  "token_type": "bearer",
  "auth_type": "agile-local",
  "token": "DdC21OZYTohbEiLmQCy31MGQELrBf2X4jbEQdQDwbFRxUYATDuHF2cdYi3waKuEl",
  "refreshToken": null,
  "user_name": "agile",
  "oauth2": "password"
}

const levelConf = {
  "token-storage": {
    "dbName": "./database_web",
    "createTables": true,
    "type": 'leveldb'
  }
}

const mongoConf = {
  "token-storage": {
    "type": "mongodb",
    "host": "agilegw.local",
    "port": 27017,
    "password": "secret",
    "user": "agile",
    "dbName": "admin",
    "collection": "token"
  }
}

function cleanDb(done) {
  done();
}

describe('Level Token Storage', function () {

  afterEach(function (done) {
    connectionPoolPromisse.closeDb(levelConf)
    cleanDb(done);
  });

  it('Should store token', function (done) {
    connectionPoolPromisse.loadDb(levelConf).then(storage => {

      return storage.storeToken(exampleToken.token, exampleToken, (result => {
        if (result.success) {
          return storage.getTokenByToken(exampleToken.token, (res => {
            if (res.success) {
              return storage.deleteTokenByToken(exampleToken.token, (res => {
                if (res.success) {
                  done()
                } else {
                  throw Error('Could not delete token')
                }
              }))
            } else {
              throw Error('Could not find token')
            }
          }))
        } else {
          throw Error('Could not load storage')
        }
      }))
    })
  });

  it('Should find token by username, clientid, oauth2 and auth_type', function (done) {
    connectionPoolPromisse.loadDb(levelConf).then(storage => {
      return storage.storeToken(exampleToken.token, exampleToken, (result => {
        if (result.success) {
          return storage.findByUserAndClientAndOauth2Type(exampleToken.user_name, exampleToken.auth_type, exampleToken.clientId, exampleToken.oauth2, (res => {
            if (res.success) {
              return storage.deleteTokenByToken(exampleToken.token, (res => {
                if (res.success) {
                  done()
                } else {
                  throw Error('Could not delete token')
                }
              }))
            } else {
              throw Error('Could not find token')
            }
          }))
        } else {
          throw Error('Could not load storage')
        }
      }))
    })
  });
});


describe('Mongo Token Storage', function () {

  afterEach(function (done) {
    connectionPoolPromisse.closeDb(mongoConf)
    cleanDb(done);
  });

  it('Should store token', function (done) {
    connectionPoolPromisse.loadDb(mongoConf).then(storage => {
      return storage.storeToken(exampleToken.token, exampleToken, (result => {
        if (result.success) {
          return storage.getTokenByToken(exampleToken.token, (res => {
            if (res.success) {
              return storage.deleteTokenByToken(exampleToken.token, (res => {
                if (res.success) {
                  done()
                } else {
                  throw Error('Could not delete token')
                }
              }))
            } else {
              throw Error('Could not find token. ' + res.error)
            }
          }))
        } else {
          throw Error('Could not load storage.' + result.error)
        }
      }))
    })
  });

  it('Should find token by username, clientid, oauth2 and auth_type', function (done) {
    connectionPoolPromisse.loadDb(mongoConf).then(storage => {
      return storage.storeToken(exampleToken.token, exampleToken, (result => {
        if (result.success) {
          return storage.findByUserAndClientAndOauth2Type(exampleToken.user_name, exampleToken.auth_type, exampleToken.clientId, exampleToken.oauth2, (res => {
            if (res.success) {
              return storage.deleteTokenByToken(exampleToken.token, (res => {
                if (res.success) {
                  done()
                } else {
                  throw Error('Could not delete token')
                }
              }))
            } else {
              throw Error('Could not find token')
            }
          }))
        } else {
          throw Error('Could not load storage')
        }
      }))
    })
  });

  it('Should throw error 1100 because of duplicate token', function (done) {
    connectionPoolPromisse.loadDb(mongoConf).then(storage => {
      return storage.storeToken(exampleToken.token, exampleToken, (result => {
        if (result.success) {
          return storage.storeToken(exampleToken.token, exampleToken, (result => {
            if (result.error && result.error.code === 11000) {
              return storage.deleteTokenByToken(exampleToken.token, (res => {
                if (res.success) {
                  done()
                } else {
                  throw Error('Could not delete token')
                }
              }))
            } else {
              throw Error('Could not load storage')
            }
          }))
        } else {
          throw Error('Could not load storage')
        }
      }))
    })
  });
})
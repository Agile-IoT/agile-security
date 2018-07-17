var db = null;
var LevelTokenStorage = require('./level-token-storage');
var MongoTokenStorage = require('./mongodb-token-storage')
//This module just exposes one single instance of sqlite everywhere...

function loadDb(conf) {
  var promisse = new Promise(function (resolve, reject) {
    if (db) {
      return resolve(db);
    } else {
      if(conf['token-storage'].type === 'leveldb') {
        db = new LevelTokenStorage();
      } else if (conf['token-storage'].type === 'mongodb') {
        db = new MongoTokenStorage();
      }
      db.init(conf['token-storage'], function (result) {
        if (result.success) {
          return resolve(db);
        } else {
          reject(new Error("error:" + result.error));
        }
      });
    }
  });
  return promisse;
}

function closeDb(conf) {
    if (db) {
        db.closeDB()
        db = null
    }
}
module.exports =
  {
    loadDb: loadDb,
    closeDb: closeDb
  };

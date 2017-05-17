var express = require('express');
var IdmCore = require('agile-idm-core');
var Storage = require('agile-idm-entity-storage').Storage;

module.exports = function (tokenConf, conf, strategies) {
  var storage = new Storage(conf);
  var idmcore = new IdmCore(conf);
  idmcore.setStorage(storage);
  var router = express.Router();
  require('./entity')(tokenConf, idmcore, router);
  require('./user')(tokenConf, idmcore, router, strategies);
  require('./group')(tokenConf, idmcore, router);
  return router;
}

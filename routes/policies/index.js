var express = require('express');
var IdmCore = require('agile-idm-core');
var Storage = require('agile-idm-entity-storage').Storage;

module.exports = function (tokenConf, conf, pdp_conf) {
  var storage = new Storage(conf);
  var idmcore = new IdmCore(conf);
  idmcore.setStorage(storage);
  var router = express.Router();

  require('./pdp')(tokenConf, idmcore, pdp_conf, router);
  require('./pap')(tokenConf, idmcore, router);

  return router;
}

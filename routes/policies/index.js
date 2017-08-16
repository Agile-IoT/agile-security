var express = require('express');
var IdmCore = require('agile-idm-core');
var Storage = require('agile-idm-entity-storage').Storage;
var Pdp = require('agile-policies').pdp;

module.exports = function (tokenConf, conf) {
  var storage = new Storage(conf);
  var idmcore = new IdmCore(conf);
  var pdp = new Pdp(idmcore);

  idmcore.setStorage(storage);
  var router = express.Router();

  require('./pdp')(tokenConf, idmcore, pdp, router);
  require('./pap')(tokenConf, idmcore, router);

  return router;
}

var express = require('express');
var IdmCore = require('agile-idm-core');
var Storage = require('agile-idm-entity-storage').Storage;
var Pdp = require('agile-policies').pdp;
var Audit = require('agile-audit');

module.exports = function (tokenConf, conf) {
  var storage = new Storage(conf);
  var idmcore = new IdmCore(conf);
  var router = express.Router();
  if (!process.env.NO_AUDIT || process.env.NO_AUDIT !== "1") {
    var audit = new Audit(conf.audit);
    idmcore.setStorage(storage);
    require('./audit')(tokenConf, idmcore, audit, router);
  } else {
    console.log('ignoring audit APIs due to NO_AUDIT env variable with value 1');
  }

  return router;
}

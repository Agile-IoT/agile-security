var express = require('express');
var IdmCore = require('agile-idm-core');
var Storage = require('agile-idm-entity-storage').Storage;

module.exports = function (conf, strategies) {
  var storage = new Storage(conf);
  var idmcore = new IdmCore(conf);
  idmcore.setStorage( storage);
  var router = express.Router();
  require('./entity')(idmcore, router);
  require('./user')(idmcore, router, strategies);
  require('./group')(idmcore, router);
  return router;
}

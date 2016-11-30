var express = require('express');
var IdmCore = require('agile-idm-core');

module.exports = function (conf, strategies) {
  var idmcore = new IdmCore(conf);
  var router = express.Router();
  require('./entity')(idmcore, router);
  require('./user')(idmcore, router, strategies);
  require('./group')(idmcore, router);
  return router;
}

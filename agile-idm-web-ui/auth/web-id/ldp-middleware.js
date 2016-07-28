module.exports = LdpMiddleware

var express = require('express')
var authentication = require('./authentication')

function LdpMiddleware (corsSettings) {
  var router = express.Router('/')
  
  if (corsSettings) {
    router.use(corsSettings)
  }

  router.use('/*', authentication)
  return router
}

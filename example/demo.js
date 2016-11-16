var passport = require('passport');
var IdmCore = require('agile-idm-core');
var session = require('express-session');

var conf = require("./conf/agile-idm-core-conf");
var idmcore = new IdmCore(conf);

var Demo = function (app) {

  //NOTE: here we use express-session to keep the user information available...
  app.get('/sensor/:sensor_id', function (req, res) {
    res.json({
      "success": true,
      "data": "hi"
    });
  });
  app.post('/sensor/:sensor_id', function (req, res) {
    console.log('got a post');
    var authData = req.user;
    if (authData) {
      if (req.body && req.body.name) {
        //console.log('body:'+JSON.stringify(req.body));
        console.log(JSON.stringify([authData.token, "create", "/Sensor", req.params.sensor_id, {
          "name": req.body.name
        }]));
        var sensor_data = {
          "name": req.body.name
        };
        idmcore.createEntity(authData.token, req.params.sensor_id, "/Sensor", sensor_data)
          .then(function (data) {
            console.log('data from api after creation: ' + JSON.stringify(data));
            res.json({
              success: true,
              data: data
            });
          }, function (error) {
            console.log('something went wrong in the example: ' + error);
            console.warn('error' + error.toString());
            res.json({
              "success": false,
              "error": error.toString()
            });
          });
      } else {
        res.send({
          success: false,
          error: 'not all parameters have been received.'
        });
      }
    } else {
      res.send({
        success: false,
        error: 'cannot find authentication info'
      });
    }
  });
};
module.exports = Demo;

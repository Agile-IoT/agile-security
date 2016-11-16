var IdmCore = require('../index');
var clone = require('clone');
var assert = require('assert');
var deepdif = require('deep-diff');
var fs = require('fs');

var db;
//conf for the API (components such as storage and authentication for the API may be replaced during tests)
var dbName = "./database_";
//var rmdir = require('rmdir');
var conf = {

    "dbName": dbName
};

function cleanDb(done){
   done();
}
describe('Level Token Storage', function () {

  describe('#insert token()', function () {

    afterEach(function (done) {
      cleanDb(done);
    });

    it('should reject with 404 error when data is not there', function (done) {

            done();
    });

  });
});

var express = require('express');
var middleware = require('./express//ldp-middleware')
var https = require('https')
var fs = require('fs')
var session = require('express-session')
var uuid = require('node-uuid')

var privateKey = fs.readFileSync( './localhost.key' );
var certificate = fs.readFileSync( './localhost.cert' );

var app = express();

var sessionSettings = {
	secret: uuid.v1(),
	saveUninitialized: false,
	resave: false,
	rolling: true
}

app.use( session(sessionSettings) )
app.use('/',middleware())

app.get('/', function (req, res, next) {
    //console.log('ldp.webid = ',ldp.webid);
    return next()
})

https.createServer({ key: privateKey, cert: certificate, requestCert : true }, app).listen(443);

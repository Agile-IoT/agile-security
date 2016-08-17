/*
This component integrates everything the Web interfaces, authentication and HTTP rest API in an express node js app.
*/

var express = require('express');
var path = require('path');
const AuthenticationMiddleware = require('./auth/auth-middleware.js');
const ValidationMiddleware = require('./auth/auth-validator-middleware.js');
const cookieParser = require('cookie-parser');
const TokenStorage = require('./auth/token-storage.js');

const HttpRestAPI = require('../agile-idm/external-api/http/http-rest-api.js');
const Authentication = require('../agile-idm-commons/authentication.js');

function WebIDMComponent(app, conf,onFinished){

    app.use(cookieParser());
    //set up authentication middleware. That includes all the Oauth2, pam_unix, etc. endpoints to express. This component also maps cookies to tokens
    var dauth = new AuthenticationMiddleware(app, conf);
    //include the validation middleware. This component validates cookies and redirects to the login pages sites not matching the allowed urls in the configuration
    conf.login.exclude_prefix.push("/api/");//to give access to the api calls introduced by HttpRest
    conf.login.exclude_prefix.push("/web_id/");//to give access to the api calls introduced by HttpRest
    var validator = new ValidationMiddleware(conf);
        // in case the validation should be used only for particular url pattern, just pass it as a first argument to the use function. Otherwise it is applied to every request (except for those starting with conf.login.exclude_prefix list.
    app.use(validator.validate.bind(validator));

    // web interface
    app.use("/static",express.static(path.join(__dirname, './static'))); //  "public" off of current is root

    //HTTP Api
    //configure the IDM Server-side REST API! To get authentication requests from the D-bus service, and other places...
    var restApiConf = {
      schema : null,
      authentication : new Authentication({"source":"token-storage","token-storage":conf["token-storage"]}),
      validator : null,
      authz : null,
      storage : null
    };
    var router = new HttpRestAPI(restApiConf);

    app.use('/api', router);
    onFinished({success:true});



}
module.exports =  WebIDMComponent;

/*
This component integrates everything the Web interfacea, authentication and HTTP rest API in an express node js app.
*/

var express = require('express');
var path = require('path');
const AuthenticationMiddleware = require('./auth/auth-middleware.js');
const ValidationMiddleware = require('./auth/auth-validator-middleware.js');
const cookieParser = require('cookie-parser');
const TokenStorage = require('./auth/token-storage.js');

const HttpRestAPI = require('../agile-idm/external-api/http/http-rest-api.js');
const Authentication = require('../agile-idm/inner-api/authentication/authentication.js');

function WebIDMComponent(app, conf,onFinished){

  var storage = new TokenStorage();
  storage.init(conf['token-storage'], setup.bind(this,storage,conf, onFinished));
  //if more dependencies need to be loaded, this should be updated to a promise
  function setup(storage, conf,callback, result){

    if(!result.success){
       console.error('could not load the token storage component!');
       return;
    }
    if( 'objects' in conf){
      conf['objects']['token-storage-obj'] = storage;
    }
    else{
       conf['objects']={'token-storage-obj':  storage};
    }


    app.use(cookieParser());
    //set up authentication middleware. That includes all the Oauth2, pam_unix, etc. endpoints to express. This component also maps cookies to tokens
    var dauth = new AuthenticationMiddleware(app, conf);
    //include the validation middleware. This component validates cookies and redirects to the login pages sites not mathing the allowed urls in the configuration
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
      authentication : new Authentication({"source":"sqlite3-db-object","objects":conf["objects"]}),
      validator : null,
      authz : null,
      storage : null
    };
    var router = new HttpRestAPI(restApiConf);

    app.use('/api', router);
    callback({success:true});
  };


}
module.exports =  WebIDMComponent;

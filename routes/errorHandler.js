module.exports= function errorHandler (err, req, res, next) {
  console.log("error handled by error handler "+err);
  if (res.headersSent) {
    return next(err)
  }
  res.status(500);
  if(process.env.DEBUG_IDM_WEB === "1"){
    res.render('error', { error: err.stack });
  }
  else{
    if(err.statusCode){
       res.render('error', { error: "error type "+err.statusCode+" error message:  "+err.message });
    }
    else{
       res.render('error', { error: "unexpected error. If this problem keeps happening contact the administrator (information about the error has been logged) :(" });
    }
  }
};

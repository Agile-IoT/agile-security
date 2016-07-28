  module.exports = handler
var webid = require('webid/tls')

function handler (req, res, next) {
  if (req.session.userId && req.session.identified) {
    res.set('User', req.session.userId)
    console.log('Return because you already have a session');
    return next()
  }

  var certificate = req.connection.getPeerCertificate()
  //console.log(req.connection.getPeerCertificate())
  // Certificate is empty? skip
  if (certificate === null || Object.keys(certificate).length === 0) {
    setEmptySession(req)
    console.log('You have a null certificate :(');

    return next()
  }

  // Verify webid
  webid.verify(certificate, function (err, result) {
    if (err) {
      setEmptySession(req)
      return next()
    }
    req.session.userId = result
    req.session.identified = true
    //console.log(req.session.userId)
    res.set('User', req.session.userId)
    console.log('Web ID authentication as user: '+ req.session.userId);

    return next()
  })
}

function setEmptySession (req) {
  req.session.userId = ''
  req.session.identified = false
}

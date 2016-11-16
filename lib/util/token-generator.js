var generateId = function(date){

};

var generateCookie = function (seconds){
  var cookie_id=Math.random().toString();
  cookie_id=cookie_id.substring(2,cookie_id.length);
  return cookie_id;
};

var generateToken = function (seconds){

};


module.exports={
   generateId: generateCookie,
   generateCookie: generateCookie,
   generateToken: generateCookie
};

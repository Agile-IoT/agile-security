var dateFormat = require('dateformat');

var dateToEpochMilis = function (date) {
  return date.getTime();
};

var currentpochMilisPlusSeconds = function (seconds) {
  var date = new Date().getTime();
  return date + (seconds * 1000);
};

module.exports = {
  dateToEpochMilis: dateToEpochMilis,
  currentpochMilisPlusSeconds: currentpochMilisPlusSeconds
};

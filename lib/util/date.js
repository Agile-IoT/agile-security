var dateFormat = require('dateformat');

var dateToSqlite = function (date) {
  dateFormat.masks.dbTime = 'yyyy-mm-dd HH:MM:ss';
  return (dateFormat(date, "dbTime"));
};

var sqliteDateNowPlusSeconds = function (seconds) {
  var date = new Date();
  date.setUTCSeconds(seconds);
  dateFormat.masks.dbTime = 'yyyy-mm-dd HH:MM:ss';
  return (dateFormat(date, "dbTime"));
};

module.exports = {
  dateToSqlite: dateToSqlite,
  sqliteDateNowPlusSeconds: sqliteDateNowPlusSeconds
};

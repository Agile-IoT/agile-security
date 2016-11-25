exports.buildId = function (user_name, auth_type) {
  return user_name + "!@!" + auth_type;
};

exports.getAuthType = function (id) {
  return id.split("!@!")[1];
};

exports.getUsername = function (id) {
  return id.split("!@!")[0];
};

function loadStrategies(conf, agile_idm_core_conf) {

  require('./github-strategy')(conf)
  require('./google-strategy')(conf)
  require('./pam-strategy')(conf)

  require('./webid-strategy')(conf)

}
module.exports = loadStrategies;

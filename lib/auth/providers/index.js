function loadStrategies(conf, agile_idm_core_conf) {

  require('./github-strategy')(conf, agile_idm_core_conf)
  require('./google-strategy')(conf, agile_idm_core_conf)
  require('./local-strategy')(conf, agile_idm_core_conf)
  require('./pam-strategy')(conf, agile_idm_core_conf)
  require('./webid-strategy')(conf, agile_idm_core_conf)

}
module.exports = loadStrategies;

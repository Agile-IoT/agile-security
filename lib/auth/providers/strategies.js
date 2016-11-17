function loadStrategies(conf) {

  require('./github-strategy')(conf)
  require('./google-strategy')(conf)
  require('./local-strategy')(conf)
  require('./webid-strategy')(conf)

}
module.exports = loadStrategies;

module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jsbeautifier: {
      modify: {
        src: ['Gruntfile.js', 'lib/**/*.js', 'routes/*/**.js', 'tests/**.js', 'scripts/*.js', 'conf/**'],
        options: {
          config: '.jsbeautifyrc'
        }
      },
      verify: {
        src: ['Gruntfile.js', 'lib/**/*.js', 'routes/*/**.js', 'tests/**.js', 'scripts/*.js'],
        options: {
          mode: 'VERIFY_ONLY',
          config: '.jsbeautifyrc'
        }
      }
    },
    jshint: {
      all: ['Gruntfile.js', 'lib/**/*.js', 'test/**.js', 'example/*.js']
    }
  });

  grunt.loadNpmTasks("grunt-jsbeautifier");
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('modify', [
    'jsbeautifier:modify',
    'jshint'
  ]);

  grunt.registerTask('verify', [
    'jsbeautifier:verify',
    'jshint'
  ]);
  // Default task(s).
  grunt.registerTask('default', ['verify']);

};

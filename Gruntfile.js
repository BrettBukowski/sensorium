module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    component: {
      build: {
        options: {
          action: 'build',
          args: {
            name: '<%= pkg.name %>'
          }
        }
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'build/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },

    jshint: {
      all: ['Gruntfile.js', 'lib/**/*.js', 'test/**/*.js', 'index.js'],
      options: {
        expr: true,
        browser: true,
        node: true
      }
    },

    watch: {
      scripts: {
        files: ['index.js', 'lib/**/*.js', 'component.json', 'Gruntfile.js'],
        tasks: ['jshint', 'component']
      }
    }

  });

  grunt.loadNpmTasks('grunt-component');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');

};

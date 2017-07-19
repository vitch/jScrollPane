/*
 * jScrollPane build script
 * http://jscrollpane.kelvinluck.com/
 *
 * Copyright (c) 2013 Kelvin Luck
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    clean: {
      options: {
        force: true   // allows deleting outside the CWD, which is /build in this case
      },
      modules: ['../script/jquery.mousewheel*.js'],
      jsp: [
        '../script/jquery.jscrollpane.min.js',
        '../script/mwheelIntent.min.js'
      ]
    },
    copy: {
      modules: {
        files: {
          '../script/jquery.mousewheel.js': './node_modules/jquery-mousewheel/jquery.mousewheel.js'
        }
      }
    },
    uglify: {
      modules: {
        files: {
          '../script/jquery.mousewheel.min.js': './node_modules/jquery-mousewheel/jquery.mousewheel.js'
        }
      },
      jsp: {
        files: {
          '../script/mwheelIntent.min.js': '../script/mwheelIntent.js',
          '../script/jquery.jscrollpane.min.js': '../script/jquery.jscrollpane.js'
        },
        options: {
          preserveComments: 'some'
        }
      }
    },
    watch: {
      content: {
        files: ['../script/jquery.jscrollpane.js'],
        tasks: 'uglify'
      }
    },
    connect: {
      site: {
        options: {
          base: '../'
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['clean', 'copy', 'uglify']);
  grunt.registerTask('serve', ['clean', 'copy', 'uglify', 'connect', 'watch']);

};

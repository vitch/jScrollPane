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
      modules: ['../script/**/jquery.mousewheel*.js'],
      jsp: [
          '../script/**/jquery.jscrollpane*.js',
          '../style/**/jquery.jscrollpane*.css',
          '../script/**/mwheelIntent*.js'
        ],
      demo: [
            '../script/**/demo*.js',
            '../style/**/demo*.css'
        ]
    },
    copy: {
      modules: {
        files: {
          '../script/jquery.mousewheel.js': './node_modules/jquery-mousewheel/jquery.mousewheel.js'
        }
      },
      jsp: {
        files: {
          '../script/mwheelIntent.js': '../src/mwheelIntent.js',
          '../script/jquery.jscrollpane.js': '../src/jquery.jscrollpane.js',
          '../style/jquery.jscrollpane.css': '../src/jquery.jscrollpane.css'
        }
      },
      demo: {
        files: {
          '../script/demo.js': '../src/demo.js',
          '../style/demo.css': '../src/demo.css'
        }
      }
    },
    uglify: {
      modules: {
        files: {
          '../script/jquery.mousewheel.min.js': './node_modules/jquery-mousewheel/jquery.mousewheel.js',
        }
      },
      jsp: {
        files: {
          '../script/mwheelIntent.min.js': '../src/mwheelIntent.js',
          '../script/jquery.jscrollpane.min.js': '../src/jquery.jscrollpane.js'
        },
        options: {
          preserveComments: 'some'
        }
      }
    },
    watch: {
      jsp: {
        files: [
          '../src/jquery.jscrollpane.js',
          '../src/jquery.jscrollpane.css',
          '../src/mwheelIntent.js'
        ],
        tasks: ['copy:jsp', 'uglify:jsp']
      },
      demo: {
        files: [
          '../src/demo.js',
          '../src/demo.css'
        ],
        tasks: ['copy:demo']
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

/*
 * jScrollPane build script
 * http://jscrollpane.kelvinluck.com/
 *
 * Copyright (c) 2013 Kelvin Luck
 * Copyright (c) 2020 Tuukka Pasanen
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        uglify: {
            jsp: {
                files: {
                    'script/jquery.jscrollpane.min.js': 'script/jquery.jscrollpane.js',
                },
                options: {
                    preserveComments: 'some',
                },
            },
        },
        watch: {
            content: {
                files: ['script/jquery.jscrollpane.js'],
                tasks: 'uglify',
            },
        },
        connect: {
            site: {
                options: {
                    base: '.',
                },
            },
        },
        prettier: {
            pretty: {
                options: {
                    printWidth: 140,
                    tabWidth: 4,
                    useTabs: false,
                    semi: true,
                    singleQuote: true,
                    trailingComma: 'all',
                    bracketSpacing: true,
                    progress: true,
                },
                src: ['Gruntfile.js', 'script/jquery.jscrollpane.js'],
            },
        },
    });

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-prettier');

    grunt.registerTask('default', ['uglify', 'prettier']);
    grunt.registerTask('serve', ['uglify', 'connect', 'watch']);
};

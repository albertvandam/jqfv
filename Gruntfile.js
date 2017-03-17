/* jshint node: true, jquery: false */
module.exports = function (grunt) {
    'use strict';

    var stylesConfig = require('./buildconfig/styles');
    var scriptsConfig = require('./buildconfig/scripts');

    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);
    require('google-closure-compiler').grunt(grunt);

    grunt.initConfig({
        pkg               : require('./package.json'),
        clean             : require('./buildconfig/clean.json'),
        jshint            : require('./buildconfig/jshint.json'),
        lesslint          : require('./buildconfig/lesslint.json'),
        less              : stylesConfig.lessConfig,
        cssmin            : stylesConfig.minConfig,
        'closure-compiler': scriptsConfig.gccConfig(grunt),
        concat            : require('./buildconfig/concat.json'),
        copy              : require('./buildconfig/copy.json'),
        usage             : require('./buildconfig/usage.json')
    });

    grunt.registerTask('default', ['usage']);
    grunt.registerTask('build', ['clean', 'jshint', 'lesslint', 'less', 'cssmin', 'closure-compiler', 'concat', 'copy', 'clean:build']);

};
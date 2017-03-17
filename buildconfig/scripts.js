/* jshint node: true, jquery: false */
module.exports = {
    gccConfig: function () {
        'use strict';

        var args = [
            '--compilation_level', 'ADVANCED_OPTIMIZATIONS'
        ];
        args = args.concat([
            '--externs', 'node_modules/google-closure-compiler/contrib/externs/jquery-3.1.js'
        ]);
        args = args.concat([
            '--externs', 'externs/TelephoneCountry.js',
            '--externs', 'externs/TelephoneCountryList.js',
            '--externs', 'externs/ValidatorOptions.js'
        ]);

        args = args.concat([
            '--js', 'src/js/telephoneCountryList.js',
            '--js', 'src/js/validator.js'
        ]);

        args = args.concat([
            '--language_out', 'ECMASCRIPT5_STRICT',
            '--js_output_file', 'build/jqfv.min.js',
            '--output_wrapper', '(function() {%output%}).call(window);'
        ]);

        return {
            'app': {
                options: {
                    args: args
                }
            }
        };
    }
};
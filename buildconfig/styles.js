/* jshint node: true, jquery: false */
module.exports = {
    lessConfig: {
        "styles": {
            "options": {
                "paths"        : [
                    "resources"
                ],
                "optimization" : 1,
                "strictImports": true,
                "strictMath"   : true,
                "sourceMap"    : false,
                "plugins"      : [
                    new (require('less-plugin-autoprefix'))()
                ]
            },
            files    : {
                'dist/jqfv.css': 'src/less/form.less'
            }
        }
    },
    minConfig : {
        "options": {
            "keepSpecialComments": 0,
            "roundingPrecision"  : -1
        },
        "styles" : {
            "files": {
                "dist/jqfv.min.css": "dist/jqfv.css"
            }
        }
    }
};
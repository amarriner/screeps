module.exports = function(grunt) {
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            all: {
                options: {
                    esversion: 6,
                    ignores: [],
                    loopfunc: true
                },
                files: {
                    src: [
                        "*.js"
                    ]
                }
            }
        },

        jsonlint: {
            all: [
                "package.json",
                ".typings.json"
            ]
        },

    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jsonlint');

    grunt.registerTask('lint', ['jsonlint', 'jshint' ]);

};

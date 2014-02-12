# Gruntfile.coffee (onmexpresstest0)
#

module.exports = (grunt) ->

    configObject =

        pkg: grunt.file.readJSON("package.json")

        browserify:
            './public/javascripts/client.js': [ './client.js' ]

    grunt.initConfig configObject

    grunt.loadNpmTasks "grunt-browserify"

    grunt.registerTask "default", [ "browserify" ]


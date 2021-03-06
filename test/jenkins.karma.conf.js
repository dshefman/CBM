// Karma configuration
// Generated on Tue May 31 2016 10:36:04 GMT-0500 (CDT)

module.exports = function(config) {
  config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '../',



        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['mocha', 'requirejs'],

        // list of files / patterns to load in the browser
        files: [
          {pattern: 'test/bower_components/**/*.js', included: false, watched:false},
          {pattern: 'test/node_modules/bam-hls/dist/**/*.js', included: false, watched:false},
          {pattern: '**/*.js', included: false},
          {pattern: '**/*.html', included: false},
          'test/test-main.js'
        ],


        proxies: {
            '/message-service/': '/base/test/bower_components/message-service/',
            '/flashobject/': '/base/test/bower_components/flashobject/',
            '/node_modules/': '/base/test/node_modules/'

        },
    // list of files to exclude
    exclude: [
        'coverage/**/*.js',
        'coverage/**/*.html',
        'test/bower_components/intent-registry/test/**/*.js'

    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        'players/**/*.js': ['coverage'],
        'overlays/**/*.js': ['coverage'],
        'utils/**/*.js' : ['coverage'],
        'helpers/**/*.js' : ['coverage']
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['dots', 'mocha', 'coverage'],

    mochaReporter: {
      showDiff: true
    },


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    browserDisconnectTimeout : 60000, // default 2000
    browserDisconnectTolerance : 1, // default 0
    browserNoActivityTimeout : 60000, //default 10000


  })
}

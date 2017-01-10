var allTestFiles = [];
var TEST_REGEXP = /specs\/.*spec\.js$/i;

// Get a list of all the test files to include
Object.keys(window.__karma__.files).forEach(function(file) {
  //window.console.log("looking at file: "+ file );
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
    // If you require sub-dependencies of test files to be loaded as-is (requiring file extension)
    // then do not normalize the paths
    /*
     var normalizedTestModule = file.replace(/^\/base\/|\.js$/g, '');
     allTestFiles.push(normalizedTestModule);
     */
    window.console.log("testing file: "+ file );

    allTestFiles.push(file);
  }
});

var bc = "test/bower_components/";

require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl:"/base/",

  paths: {
    'chai': bc+'chai/chai',

    'lodash': bc+'lodash',
    'mocha': bc+'mocha/mocha',
    'sinon': bc+'sinon/lib/sinon',



  },
  shim: {
    mocha: {
      exports: 'mocha'
    },

  },


  // dynamically load all test files
  deps: allTestFiles,

  // we have to kickoff jasmine, as it is asynchronous
  callback: window.__karma__.start
});

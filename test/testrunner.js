'use strict';

require.config({
    baseUrl: 'file:///Users/shefman/Documents/projects/whiteLabel/basesite/sections/video/bower_components',
    paths: {
        'jquery': 'bam-video-players/test/bower_components/jquery/dist/jquery',
        'lodash': 'bam-video-players/test/bower_components/lodash/lodash',
        'mocha': 'bam-video-players/test/bower_components/mocha/mocha',
        'chai': 'bam-video-players/test/bower_components/chai/chai',
        'chai-jquery': 'bam-video-players/test/bower_components/chai-jquery/chai-jquery',
        'sinon': 'bam-video-players/test/bower_components/sinon/lib/sinon',
        'text': 'bam-video-players/test/bower_components/requirejs-plugins/lib/text',
        'json': 'bam-video-players/test/bower_components/requirejs-plugins/src/json'
    },
    shim: {
        lodash: {
            exports: '_'
        },
        mocha: {
          exports: 'mocha'
        },
        'chai-jquery': {
            deps: ['jquery', 'chai']
        }
    },
    //urlArgs: 'bust=' + (new Date()).getTime()
});

define([
        'mocha',
        'chai',
        'chai-jquery'
    ],
    function(mocha, chai, chaiJquery) {
        // Chai
        var should = chai.should();
        chai.use(chaiJquery);

        mocha.setup('bdd');

        require([
            'specs/HTML5PlayerSpec.js',
        ], function(HTML5PlayerSpec) {
            mocha.run();
        });

    }
);

(function( root, factory ) {
    if( typeof define === 'function' && define.amd ) {
        // AMD
        define( [
            'lodash/lodash',
            'scruitineering/ScruitineerUtil',
            'scruitineering/WeightedSingleDance'
        ], factory );
    } else if( typeof exports === 'object' ) {
        // Node, CommonJS-like
        module.exports = factory(
            require( 'lodash/lodash' ),
            require( 'scruitineering/ScruitineerUtil' ),
            require( 'scruitineering/WeightedSingleDance' )
        );
    } else {
        // Browser globals (root is window)
        root.Scruitineer = factory(
            root.lodash,
            root.ScruitineerUtil,
            root.WeightedSingleDance
        );
    }
})( this, function( _, Util, WeightedSingleDance) {

    const RULE_10 = '10';
    const RULE_11 = '11';
    var verbose = false;

    var WeightedMultiDance = function(_verbose){
        verbose = _verbose || false; 
    };
    WeightedMultiDance.prototype.toString = function(){return 'WeightedMultiDance'};

    function log () {
        if (verbose){
            var logArgs = Array.prototype.slice.call(arguments);
            logArgs.unshift('[WeightedMultiDance]');
            console.log.apply(console.log, logArgs);
        };
    };

    /**
     * @function doFinal
     * @description takes all of the multidance results and computes the results for a all of the dances
     * @param {Object} dancePlacements [{dance: ID, final: {dancer: placement}]
     * @param {Object} judgesScores The raw judges scores that went into determining the placement [{judge: ID, final: {dancer: placement}]
     * @returns {Object} {
     *                      dancePlacements: [
     *                          {dance: id, final:{dancer, placement}}
     *                      ],
     *                      summation: {
     *                          "1-n": summedMarks
     *                      },
     *                      notes: {
     *                          dancer : {rule: 10, rank: 5}
     *                      },
     *                      rankByDancer: {
     *                          dancer: finalRankPosition
     *                      },
     *                      ranking: {
     *                          finalRankPosition: dancer
     *                      },
     *                      judgesScores
     *
     *                    }
     */
     WeightedMultiDance.prototype.doFinal = function(dancePlacements, judgesScores) {
        log('doFinal inputs', JSON.stringify(dancePlacements));
        log('doFinal judgesScores', judgesScores);

        const weightedSingleDance = new WeightedSingleDance(true);
     
        const judgeAllTogether = weightedSingleDance.doFinal(dancePlacements);

        console.log('judgeAllTogehter', judgeAllTogether);
        
        return judgeAllTogether
    }
    return WeightedMultiDance;
} );

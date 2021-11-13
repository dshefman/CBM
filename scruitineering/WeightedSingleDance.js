(function( root, factory ) {
    if( typeof define === 'function' && define.amd ) {
        // AMD
        define( [
            'lodash/lodash',
            'scruitineering/ScruitineerUtil'
        ], factory );
    } else if( typeof exports === 'object' ) {
        // Node, CommonJS-like
        module.exports = factory(
            require( 'lodash/lodash' ),
            require( 'scruitineering/ScruitineerUtil' )
        );
    } else {
        // Browser globals (root is window)
        root.WeightedSingleDance = factory(
            root.lodash,
            root.ScruitineerUtil
        );
    }
})( this, function( _, Util) {

    var verbose = false;
    var WeightedSingleDance = function(_verbose){
        verbose = _verbose || false;
    };
    
    WeightedSingleDance.prototype.toString = function(){return 'WeightedSingleDance'};

    function log () {
        if (verbose){
            var logArgs = Array.prototype.slice.call(arguments);
            logArgs.unshift('[WeightedSingleDance]');
            console.log.apply(console.log, logArgs);
        }
    }

    /**
     * @function doFinal
     * @description takes all of the judges scores and computes the results for a single dance
     * @param {Object} judgesScores [{judge: ID, final: {dancer: placement}]
     * @param {Integer} startingPosition as to which to evaluate first, defaults to 1 but it there for recursion
     * @returns {Object} {
     *                      judgesScores: [
     *                          {judge: id, final:{dancer, placement}}
     *                      ],
     *                      tabulation: {
     *                          dancer: {
     *                              "1-n": countedMarks,
     *                      },
     *                      summation: {
     *                          "1-n": summedMarks
     *                      },
     *                      rankByDancer: {
     *                          dancer: finalRankPosition
     *                      },
     *                      ranking: {
     *                          finalRankPosition: dancer
     *                      }
     *
     *                    }
     */
    WeightedSingleDance.prototype.doFinal = function(judgesScores, startingPosition){

        var numOfJudges = _.size(judgesScores);
        var startingPosition = startingPosition || 1;

        var placementsByDancer = Util.tabulatePlacementPerDancer(judgesScores);
        log('doFinal.placementsByDancer', placementsByDancer);

        var numberOfDancers = _.size(placementsByDancer);
        var numOfPlaces = _.size(placementsByDancer);
        var dancers = _.keys(placementsByDancer);
        var ordinalPositions = new Array(numOfPlaces).fill(0).map((val, index) => index + 1);

        log('doFinal.numberOfDancesr', numberOfDancers);
        log('doFinal.startingPosition', startingPosition);
        log('ordinalPositions', ordinalPositions);

        const getNumOfJudgesThatPlacedInPosition = (position) => (dancerPlacements) => dancerPlacements.filter(( placement ) => placement == position).length;
        const getNumOfJudgesThatPlaceInPositionOrBetter = (position) => (dancerPlacements) => dancerPlacements.filter(( placement ) => placement <= position).length;
        const getSumOfPlacementsGTEPosition = (position) => (dancerPlacements) =>  dancerPlacements.reduce(
            (total, placement) => (placement <= position) ? total + placement : total
            , 0);

        const isPositionInMajority = (position) => (dancerPlacements) => {
            return getNumOfJudgesThatPlaceInPositionOrBetter(position)(dancerPlacements) >= numOfJudges/2;
        }


        var computedResultPerDancer = {}; 
        Object.entries(placementsByDancer).map(([dancer, positions]) => {
            var firstPositionInMajority = ordinalPositions.find((position) => isPositionInMajority(position)(positions)) || numberOfDancers;
            var numOfJudgesThatPlaceInPositionOrBetter = getNumOfJudgesThatPlaceInPositionOrBetter(firstPositionInMajority)(positions);
            var sumOfPlacementsGTEPosition = getSumOfPlacementsGTEPosition(firstPositionInMajority)(positions);
            var remainingPositions = ordinalPositions.filter((position) => position > firstPositionInMajority)

            var sumRemainingPositions =  remainingPositions.reduce((total, position) => {
                const numOfJudgesThatPlacedInPosition = getNumOfJudgesThatPlacedInPosition(position)(positions);
                const exponent = (position - firstPositionInMajority - 1);

                total = total + numOfJudgesThatPlacedInPosition * Math.pow((2 / numOfJudges), exponent);
                
                return total;

            }, 0);

            
            var Y = firstPositionInMajority
                + (1 - numOfJudgesThatPlaceInPositionOrBetter/numOfJudges)
                - (1 / numOfJudges) * (1 - sumOfPlacementsGTEPosition/(firstPositionInMajority * numOfJudgesThatPlaceInPositionOrBetter))
                + (2 / (Math.pow(numOfJudges, 3) * numberOfDancers)) * ( (numOfJudges - numOfJudgesThatPlaceInPositionOrBetter) - sumRemainingPositions)
        
            
                computedResultPerDancer[dancer] = Y;

            })

        var sortedResults = {};
        
        Object.entries(computedResultPerDancer).sort(([, Ya], [, Yb]) => {
            if (Ya > Yb) return 1
            if (Ya < Yb) return -1
            return 0
        }).map(([dancer, Y], index, arr) => {

            //Lets format for ties, where if the next one == this one, then set the ranking at .5 of this on and set them both to that
            const ties = arr.filter(([, Yt]) => Yt === Y);
            const initialIndex = arr.findIndex(([, Yt]) => Yt === Y);
            const numOfTies = ties.length;
            const hasTies = numOfTies > 1;
            const positionOffsetForTies = ((Math.pow(numOfTies,2) + numOfTies) / 2) / numOfTies; //nth triangle number -- will return 1 for ties
            const position = initialIndex + positionOffsetForTies; // the zero index of the array is adjusted by a non-tie (val 1) to be the correct position; 
            
            if (hasTies) {
                if (!sortedResults[position]) {
                    sortedResults[position] = ties.map(([dancer]) => dancer);
                }
            } else {
                sortedResults[position] = dancer;
            }

        })

        
         log('computedResultPerDancer', computedResultPerDancer); 
         log('ranking', sortedResults);

         const rankingByDancer = Object.entries(sortedResults).reduce((obj, [placement, dancer]) => {
            const dancers = Array.isArray(dancer) ? dancer: [dancer];

            dancers.forEach((couple) => {
                obj[couple] = placement;
            });

             return obj;
         }, {})


        var rtn = {
            judgesScores: judgesScores,
            rankByDancer: rankingByDancer,
            computedResultPerDancer,
            ranking: sortedResults
        };
        log('results', JSON.stringify(rtn, null, 4));
        return rtn;
    };

    return WeightedSingleDance;
} );

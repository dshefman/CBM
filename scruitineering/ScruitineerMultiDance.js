(function( root, factory ) {
    if( typeof define === 'function' && define.amd ) {
        // AMD
        define( [
            'lodash/lodash',
            'scruitineering/ScruitineerUtil',
            'scruitineering/ScruitineerSingleDance'
        ], factory );
    } else if( typeof exports === 'object' ) {
        // Node, CommonJS-like
        module.exports = factory(
            require( 'lodash/lodash' ),
            require( 'scruitineering/ScruitineerUtil' ),
            require( 'scruitineering/ScruitineerSingleDance' )
        );
    } else {
        // Browser globals (root is window)
        root.Scruitineer = factory(
            root.lodash,
            root.ScruitineerUtil,
            root.ScruitineerSingleDance
        );
    }
})( this, function( _, Util, ScruitineerSingleDance) {

    const RULE_10 = '10';
    const RULE_11 = '11';
    var verbose = false;

    var ScruitineerMultiDance = function(_verbose){
        verbose = _verbose || false; 
    };
    ScruitineerMultiDance.prototype.toString = function(){return 'ScruitineerMultiDance'};

    function log () {
        if (verbose){
            var logArgs = Array.prototype.slice.call(arguments);
            logArgs.unshift('[ScruitineerMultiDance]');
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
     *                      }
     *
     *                    }
     */
    ScruitineerMultiDance.prototype.doFinal = function(dancePlacements, judgesScores) {
        console.log('TESTING')
        log('doFinal inputs', JSON.stringify(dancePlacements));
        var placementsByDancer = Util.tabulatePlacementPerDancer(dancePlacements); //{101: [1,1,1]
        log('doFinal.placementsByDancer', placementsByDancer);

        var placementSummationByDancer = sumPlacements(placementsByDancer); //{101: 3}
        log('doFinal.placementSummationByDancer', placementSummationByDancer);

        var sortedSummation = _.invertBy(placementSummationByDancer); // {3:[101]}
        log('sorted Summation', sortedSummation);

        var countedPlacementsPerDancer = Util.countPlacementsPerDancer(placementsByDancer);
        log('countedPlacementsPerDancer', countedPlacementsPerDancer);

        var notes = {};
        var ranking = placeDancers(sortedSummation, countedPlacementsPerDancer, notes);

        //During placeDancers, we marked but ignored tied dancers.
        //Come back and use the original raw scores to break the tie (Rule 11)
        //then merge in the broken tie results with the rest of the results
        var rule11Dancers = findRule11Dancers(notes);
        if (_.size(rule11Dancers) > 0){
            var brokenTie = breakTieAsASingleDance(judgesScores, rule11Dancers, notes);
            ranking = _.merge(ranking, brokenTie);
        }

        var rtn = {
            dancePlacements: dancePlacements,
            summation: placementSummationByDancer,
            notes: notes,
            rankByDancer: invertRanking(ranking),
            ranking: ranking
        };
        log('results', JSON.stringify(rtn, null, 4));
        return rtn;
    };

     /**
     * @function sumPlacements
     * @description takes the multidance placements and returns it as a sum
     * @param {Object} placementsByDancer [{101: [1,1,1], 102: [2,1,2] ]
     * @returns {Object} {101: 3, 102: 5}
     */
    function sumPlacements(placementsByDancer){
        var results = {};
        _.each(placementsByDancer, function(placements, dancer){
            results[dancer] = _.sum(_.map(placements, _.toNumber));
        });
        return results
    }

    /**
     * @function placeDancers
     * @description
     * @param {Object} sortedSummation {3: 101, 5:102, 7:[103,104]}
     * @param {Object} countedPlacementsPerDancer {102: {1:1, 2:2}}
     * @param {Object} notes {}
     * @returns {Object} {101: 1, 102: 2}
     */
    function placeDancers (sortedSummation, countedPlacementsPerDancer, notes){
        var ranking = {};
        var rank = 1;
        //Sort ascending the summation of each of the competitors dance placements
        //Dancers with the lowest sum have the highest score
        _.each(_.orderBy(_.keys(sortedSummation), _.toNumber, ['asc']), function(key, index){
            var sameSumDancers = _.get(sortedSummation, key);
            log('sameSumDancer',rank,  sameSumDancers);
            if (_.size(sameSumDancers) == 1) {
                //There is one clear winner, place them
                rankDancer(ranking, rank, _.first(sameSumDancers));
                rank++;
            } else {
                //No clear winner, lets go into tie-breaking
                log('summation tie for ', key, sameSumDancers);
                var tieBreakingPlacements = [];

                //Convert {dancerX:{1:1, 2:1} to [{1:1, 2:1, dancer:X}]
                //So we can group all of the dancers that are tied
                _.each(sameSumDancers, function(dancer){
                    tieBreakingPlacements.push(_.merge(_.clone(_.get(countedPlacementsPerDancer, dancer)), {'dancer':dancer}));
                });

                rank = breakTieRecursively(tieBreakingPlacements, countedPlacementsPerDancer, ranking, rank,notes, 0);

            }

        });
        //ranking = _.flatten(ranking)

        log('placeDancers', ranking);
        return ranking
    }


    /**
     * @function breakTieRecursively
     * @description
     * @param {Array} tiedPlacements [{1:1, 2:1, dancer:X}]
     * @param {Object} countedPlacementsPerDancer {102: {1:1, 2:2}}
     * @param {Object} ranking
     * @param {Integer} lookingForRankPosition
     * @param {Object} notes
     * @param {integer} iteration
     * @returns {integer} new rank
     */
    function breakTieRecursively(tiedPlacements, countedPlacements, ranking, lookingForRankPosition, notes, iteration){
        log('break tie('+iteration +') for place:' + lookingForRankPosition, tiedPlacements);

        //Breaking a summation tie is Rule10 (the dancer who has won the most number of dances)
        addNotesAboutWhatRuleIsUsed(notes, tiedPlacements, RULE_10, lookingForRankPosition);


        var findHighestPlacements = computeFindHighestPlacements(tiedPlacements, countedPlacements, lookingForRankPosition);
        log('findHighestPlacements',lookingForRankPosition, findHighestPlacements);
        //Compare only the first two, even if there are more then two that are tied. Since they are sorted, if [0] > [1] then we know there isn't a tie
        var dancerPlacements1 = findHighestPlacements[0];
        var dancerPlacements2 = findHighestPlacements[1];
        
        if (!dancerPlacements2){
            //If dancerPlacements2 DNE, then we are at the end of the tie breaking recursion
            lookingForRankPosition = rankDancer(ranking, lookingForRankPosition, dancerPlacements1.dancer);
        } else {
            lookingForRankPosition = breakTieByCountOrSum(dancerPlacements1, dancerPlacements2, ranking, lookingForRankPosition, tiedPlacements, countedPlacements, notes, iteration);
        }
        return lookingForRankPosition;

    }

    function breakTieByCountOrSum (dancerPlacements1, dancerPlacements2, ranking, lookingForRankPosition, tiedPlacements, countedPlacements, notes, iteration){
        var hasGTCounts = dancerPlacements1.count > dancerPlacements2.count;
        var hasSameCountsLTSum = dancerPlacements1.sum < dancerPlacements2.sum;
        if (hasGTCounts || hasSameCountsLTSum) {
            //We are able to break the tie because either the counts for the desired rank do not match
            //or if the counts match the sums do not.
            //rRank the dancer, then remove them from the tiebreaking list in order to contiue to break the remaining ties
            lookingForRankPosition = rankDancer(ranking, lookingForRankPosition, dancerPlacements1.dancer);
            lookingForRankPosition = removePlacedDancerAndContinueToBreakTie(tiedPlacements, dancerPlacements1.dancer, countedPlacements, ranking, lookingForRankPosition, notes, iteration)
        } else {

            lookingForRankPosition = markDancersForRule11TieBreakingAndContinueRecursion(dancerPlacements1, dancerPlacements2, tiedPlacements, notes, lookingForRankPosition, countedPlacements, ranking, iteration);
        }
        return lookingForRankPosition;
    }

    function markDancersForRule11TieBreakingAndContinueRecursion(dancerPlacements1, dancerPlacements2, tiedPlacements, notes, lookingForRankPosition, countedPlacements, ranking, iteration){
        //There is no way to break the tie with the current data, we must go back to the judges scores to see if
        //the tie can be broken with that extra data (Rule 11). Lets mark these for now, and get to rule 11 tie breaking
        //after we have placed all that we can at the moment

        //During this recursion, lets make sure we apply rule 11 ONLY to the two dancers that we are currently comparing
        //even though their may be ultimately more than 2
        var filteredTiedPlacements = _.filter(tiedPlacements, function (o) {
            return o.dancer == dancerPlacements1.dancer || o.dancer == dancerPlacements2.dancer
        });
        log('tie needs to be broken with rule 11', filteredTiedPlacements);
        addNotesAboutWhatRuleIsUsed(notes, filteredTiedPlacements, RULE_11, lookingForRankPosition);

        lookingForRankPosition += _.size(filteredTiedPlacements);

        //Grab the list of non Rule11 dancers and continue tie-breaking by rule 10
        var remainingTiedPlacements = _.reject(tiedPlacements, function (o) {
            return o.dancer == dancerPlacements1.dancer || o.dancer == dancerPlacements2.dancer
        });
        if (_.size(remainingTiedPlacements)) {
            log('continue to break tie with', remainingTiedPlacements);
            lookingForRankPosition = breakTieRecursively(remainingTiedPlacements, countedPlacements, ranking, lookingForRankPosition, notes, iteration + 1)
        }
        return lookingForRankPosition;
    }


    function removePlacedDancerAndContinueToBreakTie(tiedPlacements, dancer, countedPlacements, ranking, lookingForRankPosition, notes, iteration){
        //Remove tied dancers
        tiedPlacements = _.reject(tiedPlacements, {dancer: dancer});

        //Back to tie breaking
        if (_.size(tiedPlacements)!=0) {
            lookingForRankPosition = breakTieRecursively(tiedPlacements, countedPlacements, ranking, lookingForRankPosition, notes, iteration+1)
        }
        return lookingForRankPosition
    }

    function addNotesAboutWhatRuleIsUsed(notes, collection, rule, lookingForRankPosition){
        _.each(collection, function(dancerObj){
            notes[_.get(dancerObj, 'dancer')] = {rule: rule, rank:lookingForRankPosition};
        });

    }

    /**
     * @function computeFindHighestPlacements
     * @description When multiple dancers are tied by their sums, break it down into count and sum
     * @param {Object} tiedPlacements [{4: 2, 5: 1, 6: 1, dancer: '102'}, {3: 2, 6: 1, 7: 1, dancer: '105'}]
     * @param {Object} countedPlacements {102: {1-4: 2, 1-5: 3, 1-6: 4}, 105: {1-3: 2,  1-6: 3, 1-7:4}}
     * @param {integer} rank (4)
     * @returns {Array} [{count: 2, sum: 6, dancer: '105'},{count: 2, sum: 8, dancer: '102'}]
     */
    function computeFindHighestPlacements(tiedPlacements, countedPlacements, rank){
        var numberOfDancers = _.size(countedPlacements);
        var countedNandHigherPerDancer = Util.countNandHigherPerDancer(countedPlacements,numberOfDancers);
        log('countedNandHigherPerDancer', countedNandHigherPerDancer);

        //In the case of ties (2.5) we can't just select by assuming the key is an integer rank
        var isKeyLTERank = function (key){
            return _.ceil(_.toNumber(key)) <= rank;
        };

        var findHighestPlacements = _.orderBy(_.map(tiedPlacements, function (countedPlacement) {
            var dancer = _.get(countedPlacement, 'dancer');
            //log('countedPlacement', countedPlacement)
            var highestPlacements = _.pickBy(countedPlacement, function (value, key) {
                //log('highestPlacements pickBy',  _.toNumber(key), "<=", rank);
                return key == 'dancer' || isKeyLTERank(key);
            });
            log('highestPlacements',rank,  highestPlacements);

            var sumCount = {count: 0, sum:0, dancer: dancer};
            //Get the 1-N count for this next rank
            sumCount.count = _.get(_.get(countedNandHigherPerDancer, dancer), '1-' + rank);

            //Sum
            sumCount.sum  =  _.reduce(_.get(countedPlacements, dancer), function(result, value, key) {
                if (isKeyLTERank(key)) {
                    //log('reduce', result, value, key, result+value)
                    return result + (value * _.toNumber(key));
                }
                return result;
            }, 0);

            return sumCount;
        }), ['count', 'sum'], ['desc', 'asc']);
        return findHighestPlacements
    }

    function rankDancer( ranking, rank, dancer) {
        log('rankDancer', rank, dancer);
        ranking[rank] = dancer;
        return rank +1;
    }

    function notes_has_RULE_11(notes){
        var rtn = _.reduce(notes, function(result, val){ result = result || val == RULE_11}, false);
        log('notes_has_Rule11', notes, rtn);
        return rtn != undefined;
    }

    function findRule11Dancers(notes){
        log('findRule11Dancers.notes', notes);
        var rtn = _.reduce(notes, function(result, val, key) {
            log('findRule11Dancers.result', result,'>>', val, key);
            if (val.rule == RULE_11) {
                var currentTiedRank = _.get(result, val.rank, []);
                currentTiedRank.push(key);
                _.set(result, val.rank, currentTiedRank);
            }
            return result
        }, {});
        log('rule11Dancers', rtn);
        return rtn;
    }

    function breakTieAsASingleDance(judgesScores, tiedDancersByRank, notes){
        log('breakTieAsASingleDance', JSON.stringify(judgesScores), JSON.stringify(tiedDancersByRank));

        //Combine all of the judges scores into a simple array
        var scoresOnly = _.reduce(judgesScores, function(result, value, key){
            result.push({final:value.final});
            return result
        }, []);
        log('breakTieAsASingleDance.scoresOnly', scoresOnly);

        var singleDanceScruitineer = new ScruitineerSingleDance();
        var tiedPositions = _.keys(tiedDancersByRank).sort();

        var brokenTie = {};
        _.each(tiedPositions, function(rank){
            var dancers = _.get(tiedDancersByRank, rank, []);
            log('breakTieAsSingleDance for rank and dancers', rank, dancers);

            //Choose only the dancers scores that need to have a tie broken, ignore the other dancers
            var dancerOnlyScores = _.reduce(scoresOnly, function(result, value, key){
                result.push({final: _.pick(value.final, dancers)});
                return result
            }, []);
            log('breakTieAsSingleDance.dancerOnlyScores', dancerOnlyScores);

            //Treat the tied dancers as if they danced a single dance, but use the scores from all of the dances
            var singleDanceResults = singleDanceScruitineer.doFinal(dancerOnlyScores, rank);
            //log('breakTieAsASingleDance.results', JSON.stringify(singleDanceResults,null,4))

            //Make sure to grab the results for just the tied dancers
            var rankingsForTiedDancers = _.pick(singleDanceResults.rankByDancer, dancers);
            log('breakTieAsASingleDance.rankingsForTiedDancers', rankingsForTiedDancers);

            //Switch from {55:1, 56:2} to {1:55, 2:56} so it is easy to sort to break the tie
            var sortedRankingsForTiedDancers = _.invertBy(rankingsForTiedDancers);
            var sortedKeys = _.keys(sortedRankingsForTiedDancers).sort();

            log('breakTieAsASingleDance.sortedRankingsForTiedDancers', sortedRankingsForTiedDancers);

            var lookingForPosition = _.toInteger(rank);
            log('breakTieAsASingleDance.lookingForPosition', lookingForPosition , '-', (lookingForPosition + _.size(dancers)-1));

            _.each(sortedKeys, function(key){
                var brokenTieByDancer = _.get(sortedRankingsForTiedDancers, key);
                //_.invertBy groups items into arrays. This is useful for ties, but if there is only 1 item in the array
                // lets convert it back to a string;
                if (_.isArray(brokenTieByDancer) && brokenTieByDancer.length == 1) {
                    brokenTieByDancer = _.first(brokenTieByDancer);
                }
                _.set(brokenTie,  _.toString(lookingForPosition), brokenTieByDancer);
                lookingForPosition++;
            });
            log('breakTieAsASingleDance.brokenTie', JSON.stringify(brokenTie))
        });

        return brokenTie;
    }

    function invertRanking(ranking) { 
        var rtn = {}; 
        _.forIn(ranking, function(value, key) {
            if (_.isArray(value)) {
                _.each(value, function(v) {
                    rtn[v] = key;
                })
            } else {
                rtn[value] = key;
            }
        })
        return rtn;
    }

    return ScruitineerMultiDance;
} );

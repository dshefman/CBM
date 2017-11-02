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
        root.ScruitineerSingleDance = factory(
            root.lodash,
            root.ScruitineerUtil
        );
    }
})( this, function( _, Util) {

    var verbose = false;
    var ScruitineerSingleDance = function(_verbose){
        verbose = _verbose || false;
    };
    
    ScruitineerSingleDance.prototype.toString = function(){return 'ScruitineerSingleDance'};

    function log () {
        if (verbose){
            var logArgs = Array.prototype.slice.call(arguments);
            logArgs.unshift('[ScruitineerSingleDance]');
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
    ScruitineerSingleDance.prototype.doFinal = function(judgesScores, startingPosition){

        var numOfJudges = _.size(judgesScores);
        var startingPosition = startingPosition || 1;

        var placementsByDancer = Util.tabulatePlacementPerDancer(judgesScores);
        log('doFinal.placementsByDancer', placementsByDancer);

        var numberOfDancers = _.size(placementsByDancer);
        var numOfPlaces = _.size(placementsByDancer);
        var dancers = _.keys(placementsByDancer);

        log('doFinal.numberOfDancesr', numberOfDancers);
        log('doFinal.startingPosition', startingPosition);

        var countedPlacementsPerDancer = Util.countPlacementsPerDancer(placementsByDancer);
        log('doFinal.countedPlacementsPerDancer', countedPlacementsPerDancer);

        var countedNandHigherPerDancer = Util.countNandHigherPerDancer(countedPlacementsPerDancer,numberOfDancers, startingPosition);
        log('doFinal.countedNandHigherPerDancer', countedNandHigherPerDancer);

        var placementSummationByDancer = Util.sumPlacementsByDancer(countedPlacementsPerDancer, numOfPlaces, startingPosition);
        log('doFinal.placementSummationByDancer', placementSummationByDancer);

        var organizedByPotentialPlaces = organizeByPotentialPlaces(countedNandHigherPerDancer, placementSummationByDancer);
        log('doFinal.organizedByPotentialPlaces', organizedByPotentialPlaces);

        var rankingByDancer = placeDancers(organizedByPotentialPlaces, numOfJudges, dancers, startingPosition);
        log('doFinal.rankingByDancer', rankingByDancer);

        var rankings = buildRanking(rankingByDancer);

        var rtn = {
            judgesScores: judgesScores,
            tabulation: countedNandHigherPerDancer,
            summation: placementSummationByDancer,
            rankByDancer: rankingByDancer,
            ranking:rankings
        };
        log('results', JSON.stringify(rtn, null, 4));
        return rtn;
    };


    /**
     * @function organizeByPotentialPlaces
     * @description takes individual dancers 1-N tabulations and summations and inverts it to be keyed from the 1-N
     * @param {Object} countedNandHigherPerDancer [{dancer: {1-1: 4, 1-2: 5, 1-3: 5, 1-4: 5, 1-5: 5}]
     * @param {Object} placementSummationByDancer [{dancer: {1-1: 4, 1-2: 6, 1-3: 6, 1-4: 6, 1-5: 6}
     * @returns {Object} {1-1: [ {dancer:54, sum:4, count:4}, {dancer:55, sum:1, count:1} ]}
     */
    function organizeByPotentialPlaces(countedNandHigherPerDancer, placementSummationByDancer){
        var rtn = {};

        //Create an array for each 1-N key {1-1: [], 1-2:[] }
        _.each(countedNandHigherPerDancer, function(countedNAndHigher, dancer){
            _.each(countedNAndHigher, function(count, key){
                _.set(rtn, key, [])
            })
        });

        //Populate 1-N array with dancer and count => {1-1: [ {dancer:54, count:4}, {dancer:55, count:1} ]}
        _.each(countedNandHigherPerDancer, function(countedNAndHigher, dancer){
            _.each(countedNAndHigher, function(count, key){
                rtn[key].push ({dancer: dancer, count: count})
            })
        });

        //Populate 1-N array with dancer and sum => {1-1: [ {dancer:54, sum:4}, {dancer:55, sum:1} ]}
        _.each(placementSummationByDancer, function(placementSummation, dancer){
            _.each(placementSummation, function(sum, key){
                rtn[key].push ({dancer: dancer, sum: sum})
            })
        });

        //Consolidate the array = > {1-1: [ {dancer:54, sum:4, count:4}, {dancer:55, sum:1, count:1} ]}
        _.each(rtn, function (list, key){
            var groupByDancer = _.groupBy(list, 'dancer');
            var newList = [];
            _.each(groupByDancer, function(grouped, dancer){
                var flattenedList =_.reduce(grouped, _.merge);
                newList.push(flattenedList);
            });
            rtn[key] = newList;
        });


        return rtn;
    }

    /**
     * @function placeDancers
     * @description takes the organizedPotentialPlace list and computes the placement of each dancer (recursively)
     * @param {Object} organizedByPotentialPlaces {1-1: [ {dancer:54, sum:4, count:4}, {dancer:55, sum:1, count:1} ]}
     * @param {Integer} numOfJudges Number of Judges in this event. It is meeded to determine majority
     * @param {Array} dancers, array of all of the dancers
     * @param {Integer} lookingForCurrentPlace The current position that we are looking to fill
     * @returns {Object} rankByDancer {54:1, 55:2, 53:3}
     */
    function placeDancers(organizedByPotentialPlaces, numOfJudges, dancers, lookingForCurrentPlace){
        var rtn = {};
        var majority = numOfJudges/2;
        var placedDancers = [];
        var iterationCount = 0;

        var placeADancerPayload = {
            results: rtn,
            majority: majority,
            placedDancers: placedDancers
        };

        //Update iteration index after computing for place n
        lookingForCurrentPlace = placeDancersCompute(organizedByPotentialPlaces, lookingForCurrentPlace, iterationCount, placeADancerPayload);

        ensureAllDancersArePlaced(dancers, lookingForCurrentPlace, placeADancerPayload);

        return rtn;
    }

    function ensureAllDancersArePlaced(dancers, lookingForCurrentPlace, placeADancerPayload) {
        //After recursion, see if there are any dancers still not placed
        //Make sure eacher dancer has been ranked
        _.each(_.uniq(dancers), function(dancerToCheck){
            if (!_.isUndefined(dancerToCheck) && !_.includes(placeADancerPayload.placedDancers, dancerToCheck)){
                log('WHOA, there is a dancer that still needs to be placed', dancerToCheck);
                var dancerPlaced = placeADancer(dancerToCheck, lookingForCurrentPlace,  placeADancerPayload);
                if (dancerPlaced) {
                    //log('WHEW, we were able to place dancer', dancerToCheck, dancerPlaced);
                    return true;
                } else {
                    log('SOMETHING WENT WRONG, could not place dancer', dancerToCheck);
                    return false;
                }
            }
        });
    }

    function placeDancersCompute(organizedByPotentialPlaces, lookingForCurrentPlace, iterationCount, placeADancerPayload) {

        //prevent excess looping. return if we have already placed the results
        if (iterationCount > _.size(organizedByPotentialPlaces)) { return lookingForCurrentPlace }

        //Lets start with each place 1st, 2nd, 3rd, etc and start computing
        _.each(organizedByPotentialPlaces, function (potentialPlace, key) {

            var sortedModels = createSortedGroupedModels(potentialPlace, key, placeADancerPayload.placedDancers, placeADancerPayload.majority, iterationCount);

            //Now that it is sorted, let's pick off the first one to see if we can make a placement
            _.each(sortedModels.sortedGroupedMajority, function (groupedMajoritylist) {

                log('placeDancersCompute.groupedMajorityList', JSON.stringify(groupedMajoritylist));
                if (placeSingleMajorityPosition(groupedMajoritylist, lookingForCurrentPlace, placeADancerPayload)){
                    lookingForCurrentPlace++; //if placing the dancer was successful, then increment our iteration
                } else {
                    /*
                     There is a majority tie, Lets to to break it with the lowest sum
                     */
                    lookingForCurrentPlace = breakMajorityTieWithSummation(key, sortedModels, groupedMajoritylist, lookingForCurrentPlace, organizedByPotentialPlaces, iterationCount, placeADancerPayload);
                }
            })
        });
        return lookingForCurrentPlace;
    }

    function createSortedGroupedModels (potentialPlace, key, placedDancers, majority, iterationCount){
        //First step, order the list by highest count, then by lowest sum
        var orderedPlaces = _.orderBy(potentialPlace, ['count', 'sum'], ['desc', 'asc']);
        log('\nplaceDancersCompute(' + iterationCount + ').orderPlaces', key, placedDancers, orderedPlaces);

        /*
         Scores are only interesting if they have majority of placements, but there could be ties
         So remove entires that don't qualify as a majority
         */
        var filterdByMajority = _.filter(orderedPlaces, function (o) {
            return o.count > majority && !_.includes(placedDancers, o.dancer);
        });

        //Now that we have a majority listing in a order by count and sum, lets find the ties,
        //by grouping the matching counts and matching sums
        var groupedMajority = _.groupBy(filterdByMajority, 'count');
        var groupedSummation = _.groupBy(filterdByMajority, 'sum');

        log('placeDancersCompute.groupedMajority', JSON.stringify(groupedMajority));
        log('placeDancersCompute.groupedSummation', JSON.stringify(groupedSummation));

        /*
         To make processing easier, group majority DESCENDING (highest first) and summation ASCENDING(lowest first)
         */
        var sortedGroupedMajority = groupingSort(groupedMajority, true);
        var sortedGroupedSummation = groupingSort(groupedSummation);

        log('placeDancersCompute.sortedGroupedMajority', JSON.stringify(sortedGroupedMajority));
        log('placeDancersCompute.sortedGroupedSummation', JSON.stringify(sortedGroupedSummation));

        return {
            sortedGroupedMajority : sortedGroupedMajority,
            sortedGroupedSummation: sortedGroupedSummation
        }
    }

    function placeSingleMajorityPosition(groupedMajoritylist, lookingForCurrentPlace, placeADancerPayload) {
        return placeSinglePosition(groupedMajoritylist, lookingForCurrentPlace, placeADancerPayload, 'Majority.placingADancer')
    }
    
    function placeSinglePosition(groupedList, lookingForCurrentPlace, placeADancerPayload, logMessage) {
        if (_.size(groupedList) == 1) {
            /*
             There is no tie for this grouped list (only 1 in the first position), placeADancer()
             */
            var dancer = _.get(groupedList, '[0].dancer');
            return placeADancer(dancer, lookingForCurrentPlace, placeADancerPayload, logMessage);
        }

        return false;
    }

    function breakMajorityTieWithSummation(key, sortedModels, groupedMajoritylist, lookingForCurrentPlace, organizedByPotentialPlaces, iterationCount, placeADancerPayload){
        /*
         There is a majority tie, Lets to to break it with the lowest sum
         */

        var majorityCount = _.get(_.flattenDeep(groupedMajoritylist), '[0].count');
        //Lets make sure that we are only comparing the tied majorities. Filter out non-ties from the current list
        var sortedGroupSummationOfTiedPlaces = filterMajorityListToTiedResultsOnly(sortedModels.sortedGroupedSummation, groupedMajoritylist);
        log('placeDancersCompute.groupedSummationList for majority of ', majorityCount, JSON.stringify(sortedGroupSummationOfTiedPlaces));

        //Now that the list is limited to only tie breaking majority values, lets break the tie with summation results
        _.each(sortedGroupSummationOfTiedPlaces, function (groupedSummationList) {

            if(placeSingleSummationPosition(groupedSummationList, lookingForCurrentPlace, placeADancerPayload)){
                lookingForCurrentPlace++; //if placing the dancer was successful, then increment our iteration
            } else {

                var tiedDancerModel = findTiedDancersByPotentialPlaces(key, groupedMajoritylist, groupedSummationList, organizedByPotentialPlaces);
                lookingForCurrentPlace = breakSummationTieRecursively(key, tiedDancerModel, lookingForCurrentPlace, iterationCount, placeADancerPayload)
            }
        });
        return lookingForCurrentPlace;
    }

    function placeSingleSummationPosition(groupedSummationList, lookingForCurrentPlace, placeADancerPayload){
        return placeSinglePosition(groupedSummationList, lookingForCurrentPlace, placeADancerPayload, 'Summation.placingADancer')
    }

    function findTiedDancersByPotentialPlaces (key, groupedMajoritylist, groupedSummationList, organizedByPotentialPlaces){
        /*
         Ties for both majority and summation, Lets start looking at only the tied dancers in additional positions (rankings)
         */
        var tiedDancers = findTiedDancers(key, groupedMajoritylist, groupedSummationList);
        var filteredOrganizedByPotentialPlaces = filterTiedMajorityAndTiedSummationDancers(key, tiedDancers, organizedByPotentialPlaces);

        return {
            tiedDancers : tiedDancers,
            filteredOrganizedByPotentialPlaces: filteredOrganizedByPotentialPlaces
        }
    }

    function breakSummationTieRecursively(key, tiedDancerModel, lookingForCurrentPlace, iterationCount, placeADancerPayload){


        /*
         If we are not at the end (total number of places), then recursively try to place just the tied couples.
         If we are at the end, then it is a true tie and each dancer is awarded the mean (average) score of the positions that we are working with
         */

        var filteredOrganizedByPotentialPlaces = tiedDancerModel.filteredOrganizedByPotentialPlaces;

        if (!_.isEmpty(filteredOrganizedByPotentialPlaces)) {

            log('placeDancersCompute.majority and summation tie. new FilteredOrganizedByPotentialPlaces', JSON.stringify(filteredOrganizedByPotentialPlaces));
            lookingForCurrentPlace = placeDancersCompute(filteredOrganizedByPotentialPlaces, lookingForCurrentPlace, iterationCount + 1, placeADancerPayload);

        } else {

            lookingForCurrentPlace = placeUnbreakableTiedDancers(key, tiedDancerModel.tiedDancers, placeADancerPayload, lookingForCurrentPlace);

        }
        return lookingForCurrentPlace;
    }


    function findTiedDancers(key, groupedMajorityList, groupedSummationList){
        log('placeDancersCompute.majority and summation tie', key);
        var tiedDancersCount = _.map(groupedMajorityList, 'dancer');
        var tiedDancersSum = _.map(groupedSummationList, 'dancer');

        //Only map the dancers whose count and sum are actually tied;
        var tiedDancers = _.intersection(tiedDancersCount, tiedDancersSum);
        log('tiedDancers', groupedMajorityList, tiedDancers);

        return tiedDancers;
    }

    function filterTiedMajorityAndTiedSummationDancers(key, tiedDancers, organizedByPotentialPlaces){

        var filteredOrganizedByPotentialPlaces = {};

        var foundCurrentKey = false;
        _.each(organizedByPotentialPlaces, function (potentialPlace, key2) {
            // add a modicum of efficiency, don't count columns that we've already passed,
            // only future positions (rankings), and only the tied dancers
            var foundKeyThisIteration = false;
            if (key2 == key) {foundCurrentKey = true; foundKeyThisIteration = true}
            if (foundCurrentKey && !foundKeyThisIteration) {
                filteredOrganizedByPotentialPlaces[key2] = _.filter(potentialPlace, function (o) {
                    return _.includes(tiedDancers, o.dancer);
                });
            }
        });

        return filteredOrganizedByPotentialPlaces;
    }

    function filterMajorityListToTiedResultsOnly(sortedGroupedSummation, groupedMajoritylist ){
        //Lets make sure that we are only comparing the tied majorities. Filter out non-ties from the current list
        var sortedGroupSummationOfTiedPlaces = _.filter(sortedGroupedSummation, function(sortedGroupedSummationRank){
            var tiedDancers = _.map(groupedMajoritylist, function(dancerObj) { return _.get(dancerObj, 'dancer')});
            return _.includes(tiedDancers, _.get(sortedGroupedSummationRank, '[0].dancer'))
        });
        return sortedGroupSummationOfTiedPlaces
    }

    function placeUnbreakableTiedDancers(key, tiedDancers, placeADancerPayload, lookingForCurrentPlace) {
        // can not break the tie, compute the average score
        log('unbreakable tie for ' + key +'. with dancers:' + tiedDancers);
        var averagePositionSought = _.mean(_.map(tiedDancers, function(val, index){
            return lookingForCurrentPlace + index;
        }));

        //Since we can't break the tie, we need to place all tied dancers and increment the iteration counter
        _.each(tiedDancers, function(dancer){
            var dancerPlaced = placeADancer(dancer, averagePositionSought, placeADancerPayload);
            if (dancerPlaced) {
                lookingForCurrentPlace++;
            }
        });

        return lookingForCurrentPlace;
    }

    //Sorting a grouped collection either asc or desc
    function groupingSort(groupedCollection, isDesc){
        var rtn = [];

        var compare = function(a,b){
            var numA = _.toInteger(a);
            var numB = _.toInteger(b);

            var reverse = (isDesc) ? -1 : 1;
            if (numA < numB) return -1 * reverse;
            if (numA == numB) return 0;
            if (numA > numB) return reverse;
        };
        var sortedKeys = _.keys(groupedCollection).sort(compare);

        _.each(sortedKeys, function(key){
            var add = groupedCollection[key];
             rtn.push(add);
        });
        return rtn;
    }

    function placeADancer(dancer, place, placeADancerPayload, logMessage){
        var placedDancers = placeADancerPayload.placedDancers;
        var results = placeADancerPayload.results;

        if (_.includes(placedDancers, dancer)){
            log(dancer +' has already been placed');
            return false;
        } else {
            placedDancers.push(dancer);
            results[dancer] = _.toString(place);
            logMessage = logMessage || "";
            log('adding placed dancer:', logMessage, place, dancer);
            return true
        }
    }

    /**
     * @function buildRanking
     * @description takes the ranking by dancer and swaps it to ranking by position
     * @param {Object} placementsByDancer {54:1, 55:2, 56:3}
     * @returns {Object} rankByDancer {1:54, 2:55, 3:56} or {1:54, 2.5:[55, 56]}
     */
    function buildRanking(placementsByDancer){
        var rankings = {};
        _.forEach(placementsByDancer, function(rank, dancer){
            //see if the ranking already exists as in the case of tie
            var rankValueinRankings = _.get(rankings, rank, null);

            if (_.isNull(rankValueinRankings)) {
                rankings[rank]=dancer; //no tie, save off the value
            } else if (_.isString(rankValueinRankings)) {
                //First case of a tie
                rankings[rank] = [rankValueinRankings, dancer].sort()
            } else if (_.isArray(rankValueinRankings)) {
                //more than a two way tie
                rankValueinRankings.push(dancer);
                rankValueinRankings.sort();
            } else {
                throw Error('rankValue is unknown type')
            }
        });
        return rankings
    }


    return ScruitineerSingleDance;
} );

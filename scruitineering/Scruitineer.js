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
        root.Scruitineer = factory(
            root.lodash,
            root.ScruitineerUtil
        );
    }
})( this, function( _, Util) {


    var Scruitineer = function(){};
    Scruitineer.prototype.toString = function(){return 'Scruitineer'};
    Scruitineer.prototype.doFinal = function(judgesScores, startingPosition){
        // {judge:A, final: {dancer:placement}
        var numOfJudges = _.size(judgesScores);
        var startingPosition = startingPosition || 1;

        var placementsByDancer = Util.tabulatePlacementPerDancer(judgesScores);
        console.log('doFinal.placementsByDancer', placementsByDancer);

        var numberOfDancers = _.size(placementsByDancer);
        var numOfPlaces = _.size(placementsByDancer);

        console.log('doFinal.numberOfDancesr', numberOfDancers);
        console.log('doFinal.startingPosition', startingPosition);

        var countedPlacementsPerDancer = Util.countPlacementsPerDancer(placementsByDancer);
        console.log('doFinal.countedPlacementsPerDancer', countedPlacementsPerDancer);

        var countedNandHigherPerDancer = Util.countNandHigherPerDancer(countedPlacementsPerDancer,numberOfDancers, startingPosition);
        console.log('doFinal.countedNandHigherPerDancer', countedNandHigherPerDancer);

        var placementSummationByDancer = Util.sumPlacementsByDancer(countedPlacementsPerDancer, numOfPlaces, startingPosition);
        console.log('doFinal.placementSummationByDancer', placementSummationByDancer);

        var organizedByPotentialPlaces = organizeByPotentialPlaces(countedNandHigherPerDancer, placementSummationByDancer);
        console.log('doFinal.organizedByPotentialPlaces', organizedByPotentialPlaces);

        var rankingByDancer = placeDancers(organizedByPotentialPlaces, numOfJudges, startingPosition);
        console.log('doFinal.rankingByDancer', rankingByDancer);

        var rankings = buildRanking(rankingByDancer);

        var rtn = {
            judgesScores: judgesScores,
            tabulation: countedNandHigherPerDancer,
            summation: placementSummationByDancer,
            rankByDancer: rankingByDancer,
            ranking:rankings
        };
        console.log('results', JSON.stringify(rtn, null, 4));
        return rtn;
    };


    /*
    function countPlacementsPerDancer(placementByDancer){

        var results = {};
        _.each(placementByDancer, function (placements, dancer){
            var countsByPlacements = _.countBy(placements); //{1:4 ,2:1}
            results[dancer] = countsByPlacements;
        });
        return results;
    }
    */

    /*
    function sumPlacementsByDance(countedPlacementsPerDancer, numOfPlaces){
        var results = {};
        _.each(countedPlacementsPerDancer, function(countedPlacement, dancer){
            var total = 0;
            results[dancer] = {};
            for (var key=1; key<= numOfPlaces; key++){
                var count = _.get(countedPlacement, key, 0);
                total = total+ count*(key);
                //console.log('sumPlacementsByDance',dancer, '1-'+key, total);

                _.set(results[dancer], '1-'+key, total);
            }
        });
        return results
    }
    */

    /*
    function countNandHigherPerDancer(countedPlacementsPerDancer, numberOfPlaces){
        var results = {};
        _.each(countedPlacementsPerDancer, function(countByPlacement, dancer){
            results[dancer] = {};
            for (var i =1 ; i<= numberOfPlaces; i++){
                var key = '1-'+i;
                _.set(results[dancer], key, count1ToXPlacements(i, countByPlacement))
            }
        });

        return results;
    }

     function count1ToXPlacements(targetPlacement, countByPlacement){
     var total = 0;
     //console.log('count1ToXPlacements', targetPlacement, countByPlacement);
     for (var i = 1; i <= targetPlacement; i++){
     total += _.get(countByPlacement, i, 0);
     // console.log('count1ToXPlacements', i, total);

     }
     return total;

     }
    */



    function organizeByPotentialPlaces(countedNandHigherPerDancer, placementSummationByDancer){
        var rtn = {};
        _.each(countedNandHigherPerDancer, function(countedNAndHigher, dancer){
            _.each(countedNAndHigher, function(count, key){
                _.set(rtn, key, [])
            })
        });
        _.each(countedNandHigherPerDancer, function(countedNAndHigher, dancer){
            _.each(countedNAndHigher, function(count, key){
                rtn[key].push ({dancer: dancer, count: count})
            })
        });
        _.each(placementSummationByDancer, function(placementSummation, dancer){
            _.each(placementSummation, function(sum, key){
                rtn[key].push ({dancer: dancer, sum: sum})
            })
        });

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

    function placeDancers(organizedByPotentialPlaces, numOfJudges, lookingForCurrentPlace){
        var rtn = {};
        var majority = numOfJudges/2;
        var placedDancers = [];
        var iterationCount = 0;
        lookingForCurrentPlace = placeDancersCompute(organizedByPotentialPlaces, rtn, placedDancers, majority, lookingForCurrentPlace, iterationCount);

        //After recursion, see if there are any dancers still not placed
        //First we need to get a list of our dancers (which is not easy with the current inputs
        var dancers = [];
        _.each(organizedByPotentialPlaces, function (potentialPlace, key) {
            var orderedPlaces = _.orderBy(potentialPlace, ['count', 'sum'], ['desc', 'asc']);
            _.each(orderedPlaces, function(o){
                dancers.push(o.dancer);
            })
        })

        //Make sure eacher dancer has been ranked
        _.each(_.uniq(dancers), function(dancerToCheck){
            if (!_.isUndefined(dancerToCheck) && !_.includes(placedDancers, dancerToCheck)){
                console.log('WHOA, there is a dancer that still needs to be placed', dancerToCheck)
                var dancerPlaced = placeADancer(dancerToCheck, lookingForCurrentPlace, rtn, placedDancers);
                if (dancerPlaced) {
                    //console.log('WHEW, we were able to place dancer', dancerToCheck, dancerPlaced);
                } else {
                    console.log('SOMETHING WENT WRONG, could not place dancer', dancerToCheck);
                }
            }
        })
        return rtn;
    }

    function placeDancersCompute(organizedByPotentialPlaces, results, placedDancers, majority, lookingForCurrentPlace, iterationCount) {
        if (iterationCount > _.size(organizedByPotentialPlaces)) { return lookingForCurrentPlace } //prevent excess looping
        _.each(organizedByPotentialPlaces, function (potentialPlace, key) {
            var orderedPlaces = _.orderBy(potentialPlace, ['count', 'sum'], ['desc', 'asc']);
            console.log('\nplaceDancersCompute(' + iterationCount + ').orderPlaces', key, placedDancers, orderedPlaces);

            /*
              Columns are only interesting if they have majority of scores, but there could be ties
             */
            var filterdByMajority = _.filter(orderedPlaces, function (o) {
                //console.log('placeDancersComputer.filteredByMajority', majority, o);
                return o.count > majority && !_.includes(placedDancers, o.dancer);
            });
            var groupedMajority = _.groupBy(filterdByMajority, 'count');
            var groupedSummation = _.groupBy(filterdByMajority, 'sum');
            console.log('placeDancersCompute.groupedMajority', JSON.stringify(groupedMajority));
            console.log('placeDancersCompute.groupedSummation', JSON.stringify(groupedSummation));

            /*
            To make processing easier, group majority DESCENDING (highest first) and summation ASCENDING(lowest first)
             */
            var sortedGroupedMajority = groupingSort(groupedMajority, true);

            console.log('placeDancersCompute.sortedGroupedMajority', JSON.stringify(sortedGroupedMajority));

            var sortedGroupedSummation = groupingSort(groupedSummation);
            console.log('placeDancersCompute.sortedGroupedSummation', JSON.stringify(sortedGroupedSummation));


            _.each(sortedGroupedMajority, function (groupedMajoritylist) {
                console.log('placeDancersCompute.groupedMajorityList', JSON.stringify(groupedMajoritylist));
                /*
                There is no tie for majority, placeADancer()
                 */
                if (_.size(groupedMajoritylist) == 1) {
                    var dancerObj = groupedMajoritylist[0];
                    var dancer = _.get(dancerObj, 'dancer');
                    console.log('Majority.placingADancer', placedDancers);
                    var dancerPlaced = placeADancer(dancer, lookingForCurrentPlace, results, placedDancers);
                    if (dancerPlaced) {
                        lookingForCurrentPlace++
                    }
                } else {
                    /*
                    There is a majority tie, Lets to to break it with the lowest sum
                     */
                    var majorityCount = _.get(_.flattenDeep(groupedMajoritylist), '[0].count');

                    //Lets make sure that we are only comparing the tied majorities. Filter out non-ties from the current list
                    var sortedGroupSummationOfTiedPlaces = _.filter(sortedGroupedSummation, function(sortedGroupedSummationRank){
                        var tiedDancers = _.map(groupedMajoritylist, function(dancerObj) { return _.get(dancerObj, 'dancer')})
                        //console.log('sortedGroupSummationOfTiedPlaces', tiedDancers, sortedGroupedSummationRank)
                        return _.includes(tiedDancers, _.get(sortedGroupedSummationRank, '[0].dancer'))
                    })
                    console.log('placeDancersCompute.groupedSummationList for majority of ', majorityCount, JSON.stringify(sortedGroupSummationOfTiedPlaces));
                    _.each(sortedGroupSummationOfTiedPlaces, function (groupedSummationList) {
                        /*
                        There is not tie for summation, placeADancer()
                         */
                        if (_.size(groupedSummationList) == 1) {
                            var dancerObj = groupedSummationList[0];
                            var dancer = _.get(dancerObj, 'dancer');
                            console.log('Summation.placingADancer');
                            var dancerPlaced = placeADancer(dancer, lookingForCurrentPlace, results, placedDancers);
                            if (dancerPlaced) {
                                lookingForCurrentPlace++;
                            }
                        } else {
                            /*
                            Ties for both majority and summation, Lets start looking at only the tied dancers in additional positions (rankings)
                             */
                            console.log('placeDancersCompute.majority and summation tie', key);
                            var filteredOrganizedByPotentialPlaces = {};
                            var tiedDancersCount = _.map(groupedMajoritylist, 'dancer');
                            var tiedDancersSum = _.map(groupedSummationList, 'dancer');
                            var tiedDancers = _.intersection(tiedDancersCount, tiedDancersSum); //Only map the dancers whose count and sum are actually tied;
                            console.log('tiedDancers', groupedMajoritylist, tiedDancers);
                            var foundCurrentKey = false;
                            _.each(organizedByPotentialPlaces, function (potentialPlace, key2) {
                                // add a modicum of efficiency, don't count columns that we've already passed, only future positions (rankings), and only the tied dancers
                                var foundKeyThisIteration = false;
                                if (key2 == key) {foundCurrentKey = true; foundKeyThisIteration = true}
                                if (foundCurrentKey && !foundKeyThisIteration) {
                                    filteredOrganizedByPotentialPlaces[key2] = _.filter(potentialPlace, function (o) {
                                        return _.includes(tiedDancers, o.dancer);
                                    });
                                }
                            });
                            /*
                            If we are not at the end (total number of places), then recursively try to place just the tied couples.
                            If we are at the end, then it is a true tie and each dancer is awarded the mean (average) score of the positions that we are working with
                             */
                            if (!_.isEmpty(filteredOrganizedByPotentialPlaces)) {
                                console.log('placeDancersCompute.majority and summation tie. new FilteredOrganizedByPotentialPlaces', JSON.stringify(filteredOrganizedByPotentialPlaces));
                                lookingForCurrentPlace = placeDancersCompute(filteredOrganizedByPotentialPlaces, results, placedDancers, majority, lookingForCurrentPlace, iterationCount + 1);
                            } else {
                                console.log('unbreakable tie for ' + key +'. with dancers:' + tiedDancers);
                                var averagePositionSought = _.mean(_.map(tiedDancers, function(val, index){
                                    return lookingForCurrentPlace + index;
                                }));
                                _.each(tiedDancers, function(dancer){
                                    var dancerPlaced = placeADancer(dancer, averagePositionSought, results, placedDancers);
                                    if (dancerPlaced) {
                                        lookingForCurrentPlace++;
                                    }
                                })

                            }
                        }
                    })
                }
            })
        });
        return lookingForCurrentPlace;
    }

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

    function placeADancer(dancer, place, results, placedDancers){
        if (_.includes(placedDancers, dancer)){
            console.log(dancer +' has already been placed');
            return false;
        } else {
            placedDancers.push(dancer);
            results[dancer] = _.toString(place);
            console.log('adding placed dancer', place, dancer);
            return true
        }
    }


    function buildRanking(placementsByDancer){
        var rankings = {};
        _.forEach(placementsByDancer, function(rank, dancer){
            var rankValueinRankings = _.get(rankings, rank, null);
            if (_.isNull(rankValueinRankings)) {
                rankings[rank]=dancer;
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


    return Scruitineer;
} );

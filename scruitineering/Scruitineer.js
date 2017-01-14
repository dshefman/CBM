(function( root, factory ) {
    if( typeof define === 'function' && define.amd ) {
        // AMD
        define( [
            'lodash/lodash'
        ], factory );
    } else if( typeof exports === 'object' ) {
        // Node, CommonJS-like
        module.exports = factory(
            require( 'lodash/lodash' )
        );
    } else {
        // Browser globals (root is window)
        root.ClipReader = factory(
            root.lodash
        );
    }
})( this, function( _ ) {


    var Scruitineer = function(){};
    Scruitineer.prototype.toString = function(){return 'Scruitineer'}
    Scruitineer.prototype.doFinal = function(judgesScores){
        // {judge:A, final: {dancer:placement}
        var numOfJudges = _.size(judgesScores);

        var placementsByDancer = tabulatePlacementPerDancer(judgesScores);
        console.log('doFinal.placementsByDancer', placementsByDancer);

        var numberOfDancers = _.size(placementsByDancer);
        var numOfPlaces = _.size(placementsByDancer)

        console.log('doFinal.numberOfDancesr', numberOfDancers);

        var countedPlacementsPerDancer = countPlacementsPerDancer(placementsByDancer);
        console.log('doFinal.countedPlacementsPerDancer', countedPlacementsPerDancer);

        var countedNandHigherPerDancer = countNandHigherPerDancer(countedPlacementsPerDancer,numberOfDancers);
        console.log('doFinal.countedNandHigherPerDancer', countedNandHigherPerDancer)

        var placementSummationByDancer = sumPlacementsByDance(countedPlacementsPerDancer, numOfPlaces);
        console.log('doFinal.placementSummationByDancer', placementSummationByDancer);

        var organizedByPotentialPlaces = organizeByPotentialPlaces(countedNandHigherPerDancer, placementSummationByDancer)
        console.log('doFinal.organizedByPotentialPlaces', organizedByPotentialPlaces);

        var rankingByDancer = placeDancers(organizedByPotentialPlaces, numOfJudges);
        console.log('doFinal.rankingByDancer', rankingByDancer);

        var rankings = buildRanking(rankingByDancer);

        var rtn = {tabulation: countedNandHigherPerDancer, summation: placementSummationByDancer, rankByDancer: rankingByDancer, ranking:rankings};
        console.log('results', JSON.stringify(rtn, null, 4))
        return rtn;
    }

    function tabulatePlacementPerDancer(judgesScores){
        // returns {dancer: [placements]
        var results = {}
        _.each(judgesScores, function(scoreByJudge) {
            var judgeScore = scoreByJudge.final;
            //console.log('judge', scoreByJudge, judgeScore)

            _.each(judgeScore, function (placement, dancer){
                //console.log("each judge", scoreByJudge.judge, dancer, placement)
                if (!results[dancer]) {
                    results[dancer] = []
                }
                results[dancer].push(placement);
            })
        })
        return results;
    }

    function countPlacementsPerDancer(placementByDancer){
        var results = {}
        var tempPlacements = {};
        _.each(placementByDancer, function (placements, dancer){
            var countsByPlacements = _.countBy(placements); //{1:4 ,2:1}
            results[dancer] = countsByPlacements;
        });
        return results;
    }

    function countNandHigherPerDancer(countedPlacementsPerDancer, numberOfPlaces){
        var results = {};
        _.each(countedPlacementsPerDancer, function(countByPlacement, dancer){
            results[dancer] = {}
            for (var i =1 ; i<= numberOfPlaces; i++){
                var key = '1-'+i;
                _.set(results[dancer], key, count1ToXPlacements(i, countByPlacement))
            }
        })

        return results;
    }

    function sumPlacementsByDance(countedPlacementsPerDancer, numOfPlaces){
        var results = {};
        _.each(countedPlacementsPerDancer, function(countedPlacement, dancer){
            var total = 0;
            results[dancer] = {};
           for (var key=1; key<= numOfPlaces; key++){
                var count = _.get(countedPlacement, key, 0)
                total = total+ count*(key)
               //console.log('sumPlacementsByDance',dancer, '1-'+key, total);

               _.set(results[dancer], '1-'+key, total);
            }
        });
        return results
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

    function organizeByPotentialPlaces(countedNandHigherPerDancer, placementSummationByDancer){
        var rtn = {}
        _.each(countedNandHigherPerDancer, function(countedNAndHigher, dancer){
            _.each(countedNAndHigher, function(count, key){
                _.set(rtn, key, [])
            })
        })
        _.each(countedNandHigherPerDancer, function(countedNAndHigher, dancer){
            var dancerStats
            _.each(countedNAndHigher, function(count, key){
                rtn[key].push ({dancer: dancer, count: count})
            })
        })
        _.each(placementSummationByDancer, function(placementSummation, dancer){
            _.each(placementSummation, function(sum, key){
                rtn[key].push ({dancer: dancer, sum: sum})
            })
        })

        _.each(rtn, function (list, key){
            var groupByDancer = _.groupBy(list, 'dancer');
            var newList = [];
            _.each(groupByDancer, function(grouped, dancer){
                var flattenedList =_.reduce(grouped, _.merge)
                newList.push(flattenedList);
            })
            rtn[key] = newList;
        })


        return rtn;
    }

    function placeDancers(organizedByPotentialPlaces, numOfJudges){
        var rtn = {}
        var majority = numOfJudges/2;
        var numOfPlaces = _.size(organizedByPotentialPlaces)
        var placedDancers = [];
        var lookingForCurrentPlace = 1;
        var dancersToPlaceInNextPosition = null;
        var iterationCount = 0;
        lookingForCurrentPlace = placeDancersCompute(organizedByPotentialPlaces, rtn, placedDancers, majority, lookingForCurrentPlace, iterationCount);

        return rtn;
    }

    function placeDancersCompute(organizedByPotentialPlaces, results, placedDancers, majority, lookingForCurrentPlace, iterationCount) {
        if (iterationCount > _.size(organizedByPotentialPlaces)) { return lookingForCurrentPlace } //prevent excess looping
        _.each(organizedByPotentialPlaces, function (potentialPlace, key) {
            var orderedPlaces = _.orderBy(potentialPlace, ['count', 'sum'], ['desc', 'asc']);
            console.log('\nplaceDancersCompute(' + iterationCount + ').orderPlaces', key, placedDancers, orderedPlaces);
            var filterdByMajority = _.filter(orderedPlaces, function (o) {
                return o.count > majority && !_.includes(placedDancers, o.dancer);
            });
            var groupedMajority = _.groupBy(filterdByMajority, 'count');
            var groupedSummation = _.groupBy(filterdByMajority, 'sum');
            console.log('placeDancersCompute.groupedMajority', JSON.stringify(groupedMajority));
            console.log('placeDancersCompute.groupedSummation', JSON.stringify(groupedSummation));

            var sortedGroupedMajority = groupingSort(groupedMajority, true);

            console.log('placeDancersCompute.sortedGroupedMajority', JSON.stringify(sortedGroupedMajority));

            var sortedGroupedSummation = groupingSort(groupedSummation);
            console.log('placeDancersCompute.sortedGroupedSummation', JSON.stringify(sortedGroupedSummation));


            _.each(sortedGroupedMajority, function (groupedMajoritylist) {
                console.log('placeDancersCompute.groupedMajorityList', JSON.stringify(groupedMajoritylist));
                if (_.size(groupedMajoritylist) == 1) {
                    var dancerObj = groupedMajoritylist[0];
                    var dancer = _.get(dancerObj, 'dancer');
                    console.log('Majority.placingADancer', placedDancers);
                    var dancerPlaced = placeADancer(dancer, lookingForCurrentPlace, results, placedDancers);
                    if (dancerPlaced) {
                        lookingForCurrentPlace++
                    }
                } else {
                    //lets break some majority ties
                    majorityCount = _.get(_.flattenDeep(groupedMajoritylist), '[0].count');
                    console.log('placeDancersCompute.groupedSummationList for majority of ', majorityCount);
                    _.each(sortedGroupedSummation, function (groupedSummationList) {
                        if (_.size(groupedSummationList) == 1) {
                            var dancerObj = groupedSummationList[0];
                            var dancer = _.get(dancerObj, 'dancer');
                            console.log('Summation.placingADancer');
                            var dancerPlaced = placeADancer(dancer, lookingForCurrentPlace, results, placedDancers);
                            if (dancerPlaced) {
                                lookingForCurrentPlace++;
                            }
                        } else {
                            console.log('placeDancersCompute.majority and summation tie', key);
                            var filteredOrganizedByPotentialPlaces = {};
                            var tiedDancers = _.map(groupedMajoritylist, 'dancer');
                            console.log('tiedDancers', groupedMajoritylist, tiedDancers);
                            var foundCurrentKey = false;
                            _.each(organizedByPotentialPlaces, function (potentialPlace, key2) {
                                var foundKeyThisIteration = false;
                                if (key2 == key) {foundCurrentKey = true; foundKeyThisIteration = true}
                                if (foundCurrentKey && !foundKeyThisIteration) {
                                    filteredOrganizedByPotentialPlaces[key2] = _.filter(potentialPlace, function (o) {
                                        return _.includes(tiedDancers, o.dancer);
                                    });
                                }
                            })
                            if (!_.isEmpty(filteredOrganizedByPotentialPlaces)) {
                                console.log('placeDancersCompute.majority and summation tie. new FilteredOrganizedByPotentialPlaces', JSON.stringify(filteredOrganizedByPotentialPlaces))
                                lookingForCurrentPlace = placeDancersCompute(filteredOrganizedByPotentialPlaces, results, placedDancers, majority, lookingForCurrentPlace, iterationCount + 1);
                            } else {
                                console.log('unbreakable tie for ' + key +'. with dancers:' + tiedDancers)
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
        })
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
            if (numA > numB) return 1 * reverse;
        }
        var sortedKeys = _.keys(groupedCollection).sort(compare);

        _.each(sortedKeys, function(key){
            var add = groupedCollection[key];
             rtn.push(add);
        })
        return rtn;
    }

    function placeADancer(dancer, place, results, placedDancers){
        if (_.includes(placedDancers, dancer)){
            console.log(dancer +' has already been placed');
            return false;
        } else {
            placedDancers.push(dancer);
            results[dancer] = _.toString(place);
            console.log('adding placed dancer', place, dancer)
            return true
        }
    }


    function buildRanking(placementsByDancer){
        var rankings = {}
        _.forEach(placementsByDancer, function(rank, dancer){
            var rankValueinRankings = _.get(rankings, rank, null);
            console.log('buildRanking', rank, dancer, rankValueinRankings)
            if (_.isNull(rankValueinRankings)) {
                rankings[rank]=dancer;
            } else if (_.isString(rankValueinRankings)) {
                rankings[rank] = [rankValueinRankings, dancer].sort()
            } else if (_.isArray(rankValueinRankings)) {
                rankValueinRankings.push(dancer)
                rankValueinRankings.sort();
            } else {
                throw Error('rankValue is unknown type')
            }
            console.log('buildRanking.iteration', JSON.stringify(rankings))
        })
        return rankings
    }


    return Scruitineer;
} );

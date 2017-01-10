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
        var dancerToPlaceInNextPosition = null;
        _.each(organizedByPotentialPlaces, function (potentialPlace, key){
            var orderedPlaces = _.orderBy(potentialPlace, ['count','sum'],['desc', 'asc'])
            console.log('placeDancers.orderPlaces', key, placedDancers, orderedPlaces);
            var filterdByMajority = _.filter(orderedPlaces, function(o){
                return o.count > majority && !_.includes(placedDancers, o.dancer);
            })
            var groupedMajority = _.groupBy(filterdByMajority,'count');
            var groupedSummation = _.groupBy(filterdByMajority, 'sum')
            console.log('placeDancesr.groupedMajority', JSON.stringify(groupedMajority));
            console.log('placeDancers.groupedSummation', JSON.stringify(groupedSummation));




            var placementFound = false;
            var placementFoundCount = 0; //should be 0


            if (dancerToPlaceInNextPosition){
                placedDancers.push(dancerToPlaceInNextPosition)
                rtn[dancerToPlaceInNextPosition] = _.replace(key, '1-', '');
                dancerToPlaceInNextPosition = null;
                placementFound = true;
                console.log('adding placed dancer from prev Loop', key, dancerToPlaceInNextPosition)
            }




            while (!placementFound && placementFoundCount < numOfPlaces) {
                placementFoundCount++;

                var highestMajorityValue = _.max(_.keys(groupedMajority));
                var lowestSummativeValue = _.min(_.keys(groupedSummation));

                var highestMajorityDancersObjectArray = groupedMajority[highestMajorityValue];
                var lowestSummativeDancersObjectArray = groupedSummation[lowestSummativeValue];

                var highestMajorityDancers = _.map(highestMajorityDancersObjectArray, function (x) {
                    return _.get(x, 'dancer')
                })
                var lowestSummativeDancers = _.map(lowestSummativeDancersObjectArray, function (x) {
                    return _.get(x, 'dancer')
                })

                var dancersToAdd = highestMajorityDancers;
                if (_.size(highestMajorityDancers) > 1) {
                    console.log('switch To Rule 7: Summative for ' + key, lowestSummativeDancers)
                    dancersToAdd = lowestSummativeDancers
                }

                if (_.size(dancersToAdd) > 1){
                    dancerToPlaceInNextPosition = dancersToAdd[1]
                }

                console.log('dancers to add', dancersToAdd);
                _.each(dancersToAdd, function(dancer){
                    console.log('attempt to add dancer', dancer, 'to', placedDancers);

                    if (_.includes(placedDancers, dancer)){
                        console.log(dancer +' has already been placed');
                    } else {
                        placedDancers.push(dancer)
                        rtn[dancer] = _.toString(lookingForCurrentPlace++); //_.replace(key, '1-', '');
                        console.log('adding placed dancer', key, dancer)
                        placementFound = dancer;
                    }
                })

                if (!placementFound){
                    delete groupedMajority[highestMajorityValue];
                }
            }


        })
        return rtn;
    }



    function buildRanking(placementsByDancer){
        var rankings = {}
        _.forEach(placementsByDancer, function(rank, dancer){
            _.set(rankings, rank, dancer);
        })
        return rankings
    }


    return Scruitineer;
} );

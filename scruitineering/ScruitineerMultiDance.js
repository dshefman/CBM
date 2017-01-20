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


    var ScruitineerMultiDance = function(){};
    ScruitineerMultiDance.prototype.toString = function(){return 'ScruitineerMultiDance'};
    ScruitineerMultiDance.prototype.doFinal = function(dancePlacements) {
        var placementsByDancer = Util.tabulatePlacementPerDancer(dancePlacements); //{101: [1,1,1]
        console.log('doFinal.placementsByDancer', placementsByDancer);

        var placementSummationByDancer = sumPlacements(placementsByDancer); //{101: 3}
        console.log('doFinal.placementSummationByDancer', placementSummationByDancer);

        var sortedSummation = _.invertBy(placementSummationByDancer); // {3:[101]}
        console.log('sorted Summation', sortedSummation)

        var countedPlacementsPerDancer = Util.countPlacementsPerDancer(placementsByDancer);
        console.log('countedPlacementsPerDancer', countedPlacementsPerDancer)

        var ranking = placeDancers(sortedSummation, countedPlacementsPerDancer);

        var rtn = {
            dancePlacements: dancePlacements,
            summation: placementSummationByDancer,
            ranking: ranking
        };
        console.log('results', JSON.stringify(rtn, null, 4));
        return rtn;
    }

    function sumPlacements(placementsByDancer){
        var results = {}
        _.each(placementsByDancer, function(placements, dancer){
            results[dancer] = _.sum(_.map(placements, _.toInteger));
        });
        return results
    }

    function placeDancers (sortedSummation, countedPlacementsPerDancer){
        var ranking = {}
        var rank = 1;
        _.each(_.orderBy(_.keys(sortedSummation), _.toNumber, ['asc']), function(key, index){
            var sameSumDancers = _.get(sortedSummation, key);
            console.log('sameSumDancer', sameSumDancers);
            if (_.size(sameSumDancers) == 1) {
                rankDancer(ranking, rank, _.first(sameSumDancers))
                rank++;
            } else {
                console.log('summation tie for ', key, sameSumDancers);
                var tieBreakingPlacements = []
                _.each(sameSumDancers, function(dancer){
                    tieBreakingPlacements.push(_.merge(_.clone(_.get(countedPlacementsPerDancer, dancer)), {'dancer':dancer}));
                })
                var possiblePlaces = rank + (_.size(tieBreakingPlacements) - 1);
                var iterCount = 0;
                while(rank < possiblePlaces && iterCount < 20) {
                    console.log('tieBreakingPlacements', tieBreakingPlacements, possiblePlaces)
                    var findHighestPlacements = _.orderBy(_.map(tieBreakingPlacements, function (countedPlacement) {
                        var highestPlacements = _.pickBy(countedPlacement, function (value, key) {
                            return key <= rank || key == 'dancer'
                        })
                        console.log('highestPlacements', highestPlacements)
                        var sumCount = {sum: 0, dancer: '', highestRank: 100}
                        _.each(highestPlacements, function (value, key) {
                            if (key == 'dancer') {
                                _.set(sumCount, 'dancer', value)
                            }
                            else {
                                sumCount.sum = sumCount.sum + value;
                                if (key < sumCount.highestRank) {
                                    sumCount.highestRank = _.toNumber(key);
                                }
                            }
                        })
                        return sumCount;
                    }), ['highestRank', 'sum'], ['asc', 'desc'])
                    console.log('findHighestPlacements', findHighestPlacements)
                    _.each(findHighestPlacements, function (sumDancerObj) {
                        rankDancer(ranking, rank, sumDancerObj.dancer);
                        rank++;
                    })
                    iterCount++
                }
            }

        })
        //ranking = _.flatten(ranking)

        console.log('placeDancers', ranking)
        return ranking
    }

    function rankDancer( ranking, rank, dancer) {
        console.log('rankDancer', rank, dancer)
        ranking[rank] = dancer;
    }

    return ScruitineerMultiDance;
} );
